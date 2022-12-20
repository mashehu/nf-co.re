<script>
    export let input = [];
    import ModuleCard from './ModuleCard.svelte';
    import { CurrentFilter, SortBy, DisplayStyle, SearchQuery } from './filter.js';
    import { Card, CardHeader, CardBody, CardFooter } from 'sveltestrap';
    let displayStyle = 'grid';


    // const searchInput = (module) => {
    //     if ($SearchQuery === '') {
    //         return true;
    //     }
    //     if (module.name.toLowerCase().includes($SearchQuery.toLowerCase())) {
    //         return true;
    //     }
    //     if (module.description && module.description.toLowerCase().includes($SearchQuery.toLowerCase())) {
    //         return true;
    //     }
    //     if (module.topics.some((topic) => topic.toLowerCase().includes($SearchQuery.toLowerCase()))) {
    //         return true;
    //     }
    //     return false;
    // };

    // const filterInput = (module) => {
    //     if ($CurrentFilter.includes('Released') && module.releases.length > 0 && !module.archived ) {
    //         return true;
    //     }
    //     if ($CurrentFilter.includes('Under development') && module.releases.length === 0 && !module.archived) {
    //         return true;
    //     }
    //     if ($CurrentFilter.includes('Archived') && module.archived === true) {
    //         return true;
    //     }
    //     return false;
    // };

    // const sortInput = (a, b) => {
    //     if ($SortBy === 'Alphabetical') {
    //         return a.name.localeCompare(b.name);
    //     } else if ($SortBy === 'Stars') {
    //         return b.stargazers_count - a.stargazers_count;
    //     } else if ($SortBy === 'Last release') {
    //         // handle case where a module has no releases
    //         if (a.releases.length === 0) {
    //             return 1;
    //         }
    //         if (b.releases.length === 0) {
    //             return -1;
    //         }
    //         return (
    //             new Date(b.releases[b.releases.length - 1].published_at) -
    //             new Date(a.releases[a.releases.length - 1].published_at)
    //         );
    //     }
    // };
    // function searchFilterSortInput(input) {
    //     return input.filter(filterInput).sort(sortInput).filter(searchInput);
    // }
    // SortBy.subscribe(() => {
    //     filteredInput = searchFilterSortInput(input);
    // });
    // CurrentFilter.subscribe(() => {
    //     filteredInput = searchFilterSortInput(input);
    // });
    // SearchQuery.subscribe(() => {
    //     filteredInput = searchFilterSortInput(input);
    // });

    // $: filteredInput = searchFilterSortInput(input);
    $: filteredInput = input;
</script>

<div class="listing d-flex flex-wrap w-100 justify-content-center">
    {#if $DisplayStyle === 'grid'}
        {#each filteredInput as module (module.name)}
            <ModuleCard module={module} />
        {/each}
    {:else if $DisplayStyle === 'table'}
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Status</th>
                    <th scope="col">Stars</th>
                    <th scope="col">Last Release</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredInput as module}
                    <tr>
                        <td>
                            <a href={module.html_url} target="_blank">{module.name}</a>
                        </td>
                        <td>
                            {module.description}
                        </td>
                        <td>
                            {module.archived
                                ? 'Archived'
                                : module.releases.length > 0
                                ? 'Released'
                                : 'Under Development'}
                        </td>
                        <td class="text-end">
                            {module.stargazers_count}
                        </td>
                        <td class="text-end">
                            {module.releases.length > 0
                                ? module.releases[module.releases.length - 1].tag_name
                                : '-'}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<style>
    .card {
        width: 300px;
    }
</style>
