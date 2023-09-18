{
  description = "Just a shell for now";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
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
        packages = with pkgs; [
          nodejs-slim_latest
          nodePackages_latest.dotenv-cli
          bun
        ];
        node_modules = with pkgs; stdenv.mkDerivation {
          pname = "document-search-node_modules";
          version = "0.0.1";
          impureEnvVars = lib.fetchers.proxyImpureEnvVars
            ++ [ "GIT_PROXY_COMMAND" "SOCKS_SERVER" ];
          src = ./.;
          nativeBuildInputs = [ bun ];
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
          nativeBuildInputs = [
            makeBinaryWrapper
            nodejs-slim_latest # required by vite
          ];
          buildInputs = [ bun ];

          configurePhase = ''
            runHook preConfigure

            ln -s ${node_modules}/node_modules node_modules

            runHook postConfigure
          '';

          env.UNSTRUCTURED_API_KEY = "REPLACE_ME";
          env.HUGGINGFACE_API_TOKEN = "REPLACE_ME";

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

            makeWrapper ${bun}/bin/bun $out/bin/document-search \
              --add-flags "run --prefer-offline --no-install --cwd $out start"

            runHook postInstall
          '';
        };
      in
      {
        packages.default = document-search;
        devShell = pkgs.devshell.mkShell {
          inherit packages;
          env = [
            {
              name = "PUBLIC_SURREAL_URL";
              value = "";
            }
            {
              name = "PUBLIC_SURREAL_NAMESPACE";
              value = "test";
            }
            {
              name = "PUBLIC_SURREAL_DATABASE";
              value = "rex";
            }
          ];
          commands = [
            {
              name = "clean";
              category = "dev";
              help = "Clean the package manager directory and local direnv";
              command = ''
                direnv prune
                pnpm prune
                pnpm store prune
              '';
            }
            {
              name = "dev";
              category = "dev";
              help = "Start dev server locally";
              command = "pnpm run dev";
            }
            {
              name = "deps_update";
              category = "dev";
              help = "update dependencies";
              command = "pnpm up --interactive --latest";
            }
            {
              name = "build";
              category = "dev";
              help = "build the project for release";
              command = "pnpm run build";
            }
            {
              name = "preview";
              category = "dev";
              help = "preview the release build";
              command = "pnpm run preview";
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
