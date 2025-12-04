<template>
  <div class="bg-card-bg p-6 rounded-3xl border border-white/5">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-white font-bold text-lg">Statistics</h3>
      <select class="bg-dashboard-bg text-text-muted text-sm px-3 py-1 rounded-lg outline-none border border-white/10">
        <option>This Week</option>
      </select>
    </div>

    <div class="h-48 flex items-end justify-between gap-2 px-2">
      <div class="w-full bg-white/5 rounded-t-lg hover:bg-accent/50 transition-all h-[40%] relative group">
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition text-white">Mon</div>
      </div>
      <div class="w-full bg-accent rounded-t-lg shadow-[0_0_15px_rgba(108,93,211,0.5)] h-[80%] relative group">
         <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded text-white">Tue</div>
      </div>
      <div class="w-full bg-white/5 rounded-t-lg hover:bg-accent/50 transition-all h-[30%]"></div>
      <div class="w-full bg-white/5 rounded-t-lg hover:bg-accent/50 transition-all h-[50%]"></div>
      <div class="w-full bg-white/5 rounded-t-lg hover:bg-accent/50 transition-all h-[60%]"></div>
      <div class="w-full bg-white/5 rounded-t-lg hover:bg-accent/50 transition-all h-[45%]"></div>
      <div class="w-full bg-white/5 rounded-t-lg hover:bg-accent/50 transition-all h-[70%]"></div>
    </div>
  </div>
</template>