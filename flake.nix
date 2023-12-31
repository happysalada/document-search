{
  description = "Just a shell for now";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    devshell.url = "github:numtide/devshell";
    devshell.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { nixpkgs, flake-utils, devshell, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ devshell.overlays.default ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
        pythonPackages = ps: with ps; [
          qdrant-client
          fastembed
          python-lsp-server
        ] ++ qdrant-client.optional-dependencies.fastembed;
        packages = with pkgs; [
          nodejs-slim_latest
          nodePackages_latest.dotenv-cli
          bun
          (python3.withPackages pythonPackages)
        ];
        node_modules = with pkgs; stdenv.mkDerivation {
          pname = "document-search-node_modules";
          version = "0.0.1";
          impureEnvVars = lib.fetchers.proxyImpureEnvVars
            ++ [ "GIT_PROXY_COMMAND" "SOCKS_SERVER" ];
          src = ./.;
          nativeBuildInputs = [ bun ];
          buildInputs = [ nodejs-slim_latest ];
          dontConfigure = true;
          buildPhase = ''
            bun install --no-progress --frozen-lockfile
          '';
          installPhase = ''
            mkdir -p $out/node_modules

            cp -R ./node_modules $out
          '';
          outputHash = if stdenv.isLinux then "sha256-vNPLtQVDLeR+TenFM0SIQ7rminT3fOUN98obaibeEW4=" else "sha256-nkPbmg/kG8Id8nGYz2x0drarDD/1qsCPL4Dgg21tmNw=";
          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
        };
        document-search = with pkgs; stdenv.mkDerivation {
          pname = "document-search";
          version = "0.0.1";
          src = ./.;
          nativeBuildInputs = [ makeBinaryWrapper ];
          buildInputs = [ bun ];

          configurePhase = ''
            runHook preConfigure

            # node modules need to be copied to substitute for reference
            # substitution step cannot be done before otherwise
            # nix complains about unallowed reference in FOD
            cp -R ${node_modules}/node_modules .
            # bun installs .bin package with a usr bin env ref to node
            # replace any ref for bin that are used
            substituteInPlace node_modules/.bin/vite \
              --replace "/usr/bin/env node" "${nodejs-slim_latest}/bin/node"

            runHook postConfigure
          '';

          env.UNSTRUCTURED_API_KEY = "REPLACE_ME_UNSTRUCTURED_API_KEY";
          env.HUGGINGFACE_API_TOKEN = "REPLACE_ME_HUGGINGFACE_API_TOKEN";

          buildPhase = ''
            runHook preBuild

            bun run build

            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin
            ln -s ${node_modules}/node_modules $out
            cp -R ./build/* $out

            # bun is referenced naked in the package.json generated script
            makeBinaryWrapper ${bun}/bin/bun $out/bin/document-search \
              --prefix PATH : ${lib.makeBinPath [ bun ]} \
              --add-flags "run --prefer-offline --no-install --cwd $out start"

            runHook postInstall
          '';
        };
        module = { config, lib, ... }: 
        let
          cfg = config.services.document-search;
        in
          {
            options.services.document-search = {
              enable = lib.mkEnableOption (lib.mdDoc "A prototype document search engine");

              package = lib.mkOption {
                defaultText = lib.literalExpression "pkgs.document-search";
                type = lib.types.package;
                description = lib.mdDoc ''
                  Which derivation to use.
                '';
              };

              host = lib.mkOption {
                type = lib.types.str;
                description = lib.mdDoc ''
                  The host that document-search will connect to.
                '';
                default = "127.0.0.1";
                example = "127.0.0.1";
              };

              port = lib.mkOption {
                type = lib.types.port;
                description = lib.mdDoc ''
                  The port that document-search will connect to.
                '';
                default = 3333;
                example = 3333;
              };

              origin = lib.mkOption {
                type = lib.types.str;
                description = lib.mdDoc ''
                  The origin from which the app will be served.
                '';
                default = "";
                example = "search.toagora.com";
              };

              unstructuredApiKeyPath = lib.mkOption {
                type = lib.types.path;
                description = lib.mdDoc ''
                  Path to the unstructured api key secret file.
                '';
                default = "";
                example = "config.age.secrets.UNSTRUCTURED_API_KEY.path";
              };

              huggingfaceApiTokenPath = lib.mkOption {
                type = lib.types.path;
                description = lib.mdDoc ''
                  Path to the huggingface api token secret file.
                '';
                default = "";
                example = "config.age.secrets.HUGGINGFACE_API_TOKEN.path";
              };

              collection = lib.mkOption {
                type = lib.types.str;
                description = lib.mdDoc ''
                  The name of the collection that will used for search.
                '';
                default = "";
                example = "agora_anonymised_2";
              };
            };
            config = lib.mkIf cfg.enable {

             systemd.services.document-search = {
                description = "Search engine for documents";
                after = [ "network.target" ];
                wantedBy = [ "multi-user.target" ];

                serviceConfig = {
                  DynamicUser = true;
                  Restart = "on-failure";
                  StateDirectory = "document-search";
                  LoadCredential = [
                    "UNSTRUCTURED_API_KEY_FILE:${cfg.unstructuredApiKeyPath}"
                    "HUGGINGFACE_API_TOKEN_FILE:${cfg.huggingfaceApiTokenPath}"
                  ];
                };

                script = ''
                  export UNSTRUCTURED_API_KEY=$(${pkgs.systemd}/bin/systemd-creds cat UNSTRUCTURED_API_KEY_FILE)
                  export HUGGINGFACE_API_TOKEN=$(${pkgs.systemd}/bin/systemd-creds cat HUGGINGFACE_API_TOKEN_FILE)
                  exec ${cfg.package}/bin/document-search
                '';


                environment = {
                  PORT = toString cfg.port;
                  HOST = cfg.host;
                  ORIGIN = cfg.origin;
                  COLLECTION = cfg.collection;
                };
              };
            };
          };
      in
      {
        packages.default = document-search;
        nixosModules.default = module;
        devShell = pkgs.devshell.mkShell {
          inherit packages;
          env = [ ];
          commands = [
            # {
            #   name = "clean";
            #   category = "dev";
            #   help = "Clean the package manager directory and local direnv";
            #   command = ''
            #     direnv prune
            #     pnpm prune
            #     pnpm store prune
            #   '';
            # }
            {
              name = "dev";
              category = "dev";
              help = "Start dev server locally";
              command = "bun run dev";
            }
            {
              name = "deps_update";
              category = "dev";
              help = "update dependencies";
              command = "bun update --save";
            }
            {
              name = "build";
              category = "dev";
              help = "build the project for release";
              command = "bun run build";
            }
            {
              name = "preview";
              category = "dev";
              help = "preview the release build";
              command = "bun run preview";
            }
            {
              name = "logs";
              category = "dev";
              help = "tail prod logs for inspection";
              command = "wrangler pages deployment tail --project-name document-search";
            }
          ];
        };
      }
    );
}
