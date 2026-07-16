<script lang="ts">
    import FilterBar from "@components/FilterBar.svelte";
    import AdvisoryCard from "@components/advisory/AdvisoryCard.svelte";
    import { CurrentFilter, SearchQuery } from "@components/store";
    import { parseSearchQuery, matchesSearch } from "@utils/search";
    import { onMount } from "svelte";
    import type { CollectionEntry } from "astro:content";
    import { advisoryTypes, advisoryClasses, advisoryIcons, formatAdvisoryType } from "./advisoryUtils";

    interface Props {
        advisories?: CollectionEntry<"advisories">[];
        currentFilters: { name: string }[];
    }

    let { advisories = [], currentFilters }: Props = $props();

    const formattedAdvisoryTypes = advisoryTypes.map((type) => ({
        name: type.name,
        displayName: formatAdvisoryType(type.name),
        icon: advisoryIcons[type.name],
        class: advisoryClasses[type.name],
    }));

    const filterByType = (advisory: CollectionEntry<"advisories">) => {
        if ($CurrentFilter.length === 0) return true;
        return $CurrentFilter.some((f) => advisory.data.type.includes(f.name as (typeof advisory.data.type)[number]));
    };

    let searchTerms = $derived(parseSearchQuery($SearchQuery));

    const pipelineName = (pipeline: string | { name: string }): string =>
        typeof pipeline === "string" ? pipeline : pipeline.name;

    const searchAdvisories = (advisory: CollectionEntry<"advisories">) =>
        matchesSearch(
            {
                name: advisory.data.title,
                description: advisory.data.subtitle,
                keywords: [
                    advisory.data.severity,
                    ...advisory.data.type,
                    ...advisory.data.category,
                    ...(advisory.data.pipelines ?? []).map(pipelineName),
                    ...(advisory.data.modules ?? []),
                ],
            },
            searchTerms,
        );

    let filteredAdvisories = $derived(advisories.filter(filterByType).filter(searchAdvisories));

    let sortedAdvisories = $derived(
        [...filteredAdvisories].sort((a, b) => {
            const dateA = a.data.publishedDate?.getTime() ?? 0;
            const dateB = b.data.publishedDate?.getTime() ?? 0;
            return dateB - dateA; // Sort by most recent first
        }),
    );

    function hasYearChanged(advisories, idx) {
        if (
            idx === 0 ||
            advisories[idx].data.publishedDate?.getFullYear() !== advisories[idx - 1].data.publishedDate?.getFullYear()
        ) {
            return true;
        }
        return false;
    }

    onMount(() => {
        if (currentFilters.length > 0) {
            CurrentFilter.set(currentFilters);
        }
    });
</script>

<div>
    <FilterBar filter={formattedAdvisoryTypes} displayStyle={[]} sortBy={[]} filterName={() => "Advisory type"}
    ></FilterBar>
    <div class="advisories">
        <div class="d-flex flex-column">
            <div class="mb-3">
                {#each sortedAdvisories as advisories, idx (advisories.id)}
                    {#if hasYearChanged(sortedAdvisories, idx)}
                        <h3 id={"year-" + advisories.data.publishedDate?.getFullYear()}>
                            {advisories.data.publishedDate?.getFullYear()}
                        </h3>
                    {/if}
                    <AdvisoryCard frontmatter={advisories.data} slug={advisories.id} />
                {/each}
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    h3:not(:first-child) {
        margin-top: 0.5rem;
    }
</style>
