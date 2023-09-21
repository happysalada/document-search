<script lang="ts">
  import { enhance } from '$app/forms';

  import { MetaTags } from 'svelte-meta-tags';
  import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
  import Loader from '$lib/Loader.svelte';

  let loading = false;
  let files: any;
  let fileInput: HTMLInputElement;
  let error: string | undefined = undefined;
  let results: any[] = [];

  function handleFilesSelect(e: { detail: { acceptedFiles: File[]; fileRejections: File[] } }) {
    const { acceptedFiles, fileRejections } = e.detail;
    console.log(acceptedFiles, 'accepted');
    console.log(fileRejections, 'rejected');
  }
</script>

<MetaTags title="Document search" description="Drop a document and search for similar ones" />

<body class="bg-gray-50 min-h-screen h-full flex flex-col items-center justify-center">
  <h1 class="text-4xl md:text-5xl font-bold m-6 text-center">Search contracts database</h1>
  <p class="mb-4 mx-4">Drop your documents to search for similar ones</p>
  {#if error}
    <div class="rounded-2xl w-96 bg-base-100 shadow-xl">
      <div class="px-4 text-sm flex">
        <p>{error}</p>
      </div>
    </div>
  {:else if results.length !== 0}
    {#each results as { original, payload, score }}
      <div class="grid grid-cols-3 gap-4 sm:grid-cols-3">
        <div
          class="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
          <div class="min-w-0 flex-1">
            <p class="text-sm text-gray-500">{original}</p>
          </div>
        </div>

        <div
          class="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
          <div class="min-w-0 flex-1">
            <p class="text-sm text-gray-500">{score} {payload.text}</p>
          </div>
        </div>

        <div
          class="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
          <div class="min-w-0 flex-1">
            {#each payload.deliverables as { title }}
              <p class="text-sm text-gray-500">{title}</p>
            {/each}
          </div>
        </div>

        <!-- More people... -->
      </div>
    {/each}
  {:else}
    <div class="mb-4">
      <form
        method="POST"
        enctype="multipart/form-data"
        use:enhance={() => {
          loading = true;
          return async ({ result }) => {
            loading = false;
            console.log(result);
            results = result.data;
            if (result?.error) {
              error = result?.error.message;
            }
          };
        }}
      >
        {#if loading}
          <Loader />
        {:else}
          <div class="col-span-full">
            <div
              class="mt-2 flex flex-col justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
            >
              <Dropzone
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf"
                multiple={false}
                on:drop={handleFilesSelect}
                inputElement={fileInput}
              >
                <div class="text-center">
                  <svg
                    class="mx-auto h-12 w-12 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <button type="button">Choose documents to upload</button>
                  <p>or</p>
                  <p>Drag and drop them here</p>
                </div>
              </Dropzone>
              <input
                class="hidden"
                bind:this={fileInput}
                name="files"
                type="file"
                multiple
                bind:files
              />
              <ol>
                {#each Array.from(files || []) as item}
                  <li>{item.name}</li>
                {/each}
              </ol>
            </div>
          </div>
          {#if files?.length ?? 0 != 0}
            <div class="my-12 text-center">
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-6 px-4 rounded"
                >Generate a better report</button
              >
            </div>
          {/if}
        {/if}
      </form>
    </div>
  {/if}
</body>
