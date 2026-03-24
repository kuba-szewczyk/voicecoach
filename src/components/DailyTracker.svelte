<script lang="ts">
  import { completedDays } from '../store/settings'

  // Show the last 28 days (4 weeks)
  const DAYS_TO_SHOW = 28
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  function getDayGrid(): { date: string; completed: boolean; isToday: boolean; dayOfWeek: number }[] {
    const today = new Date()
    const days: { date: string; completed: boolean; isToday: boolean; dayOfWeek: number }[] = []

    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      days.push({
        date: iso,
        completed: $completedDays.includes(iso),
        isToday: i === 0,
        dayOfWeek: (d.getDay() + 6) % 7, // Mon=0, Sun=6
      })
    }

    return days
  }

  $: days = getDayGrid()
  $: streakCount = countCurrentStreak()
  $: totalSessions = $completedDays.length

  function countCurrentStreak(): number {
    let streak = 0
    const today = new Date()
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      if ($completedDays.includes(iso)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }
</script>

<div class="tracker">
  <div class="tracker-header">
    <span class="tracker-title">Daily Practice</span>
    <div class="stats">
      {#if streakCount > 0}
        <span class="streak">{streakCount} day streak</span>
      {/if}
      <span class="total">{totalSessions} total</span>
    </div>
  </div>

  <div class="day-labels">
    {#each DAY_LABELS as label}
      <span class="day-label">{label}</span>
    {/each}
  </div>

  <div class="grid">
    <!-- Pad first row to align with day of week -->
    {#if days.length > 0}
      {#each Array(days[0].dayOfWeek) as _}
        <span class="dot empty"></span>
      {/each}
    {/if}
    {#each days as day}
      <span
        class="dot"
        class:completed={day.completed}
        class:today={day.isToday}
        title={day.date}
      ></span>
    {/each}
  </div>
</div>

<style>
  .tracker {
    width: 100%;
    padding: 16px;
    background: #1e293b;
    border-radius: 12px;
    border: 1px solid #334155;
  }

  .tracker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .tracker-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stats {
    display: flex;
    gap: 10px;
    font-size: 0.75rem;
  }

  .streak {
    color: #22c55e;
    font-weight: 600;
  }

  .total {
    color: #64748b;
  }

  .day-labels {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 4px;
  }

  .day-label {
    text-align: center;
    font-size: 0.6rem;
    color: #475569;
    font-weight: 600;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .dot {
    aspect-ratio: 1;
    border-radius: 3px;
    background: #0f172a;
  }

  .dot.empty {
    background: transparent;
  }

  .dot.completed {
    background: #22c55e;
  }

  .dot.today {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }
</style>
