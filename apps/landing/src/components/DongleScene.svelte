<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./DongleSceneInner.svelte";

  // Port labels tracking the projected positions of the real J1/J2 connectors.
  let host = $state<{ x: number; y: number }>();
  let target = $state<{ x: number; y: number }>();
  function onports(h: { x: number; y: number }, t: { x: number; y: number }) {
    host = h;
    target = t;
  }
</script>

<div class="relative h-full w-full">
  <Canvas>
    <Scene {onports} />
  </Canvas>
  {#if host && target}
    {#each [
      { p: host, label: "To your computer", end: false },
      { p: target, label: "To the mac you're fixing", end: true },
    ] as { p, label, end } (label)}
      <!-- each label hangs inward from its port so it never runs off the edge -->
      <span
        class="pointer-events-none absolute z-10 flex flex-col text-[12px] text-silk {end
          ? '-translate-x-full items-end'
          : 'items-start'}"
        style="left: {Math.min(Math.max(p.x, 0.04), 0.96) * 100}%; top: {p.y * 100}%"
      >
        <span class="h-10 w-px bg-silk3/60"></span>
        <span class="rounded-[3px] bg-mask-deep/85 px-1.5 py-0.5 whitespace-nowrap">{label}</span>
      </span>
    {/each}
  {/if}
</div>
