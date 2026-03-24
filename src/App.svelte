<script lang="ts">
  import { wordList, targetPitchRange, sessionDuration } from './store/settings'
  import Onboarding from './components/Onboarding.svelte'
  import Home from './components/Home.svelte'
  import Session from './components/Session.svelte'
  import SessionComplete from './components/SessionComplete.svelte'
  import Calibration from './components/Calibration.svelte'
  import CalibrationConfirm from './components/CalibrationConfirm.svelte'
  import WordListEditor from './components/WordListEditor.svelte'

  type Screen =
    | 'onboarding'
    | 'home'
    | 'session'
    | 'session-complete'
    | 'calibrate'
    | 'calibrate-confirm'
    | 'edit-words'

  let screen: Screen = ($wordList.length > 0 && $targetPitchRange !== null) ? 'home' : 'onboarding'
  let pendingRange: { low: number; high: number } | null = null
</script>

<main>
  {#if screen === 'onboarding'}
    <Onboarding onComplete={() => { screen = 'home' }} />
  {:else if screen === 'home'}
    <Home
      onStart={() => { screen = 'session' }}
      onEditWords={() => { screen = 'edit-words' }}
      onCalibrate={() => { screen = 'calibrate' }}
    />
  {:else if screen === 'session' && $targetPitchRange}
    <Session
      targetRange={$targetPitchRange}
      durationMinutes={$sessionDuration}
      onComplete={() => { screen = 'session-complete' }}
      onExit={() => { screen = 'home' }}
    />
  {:else if screen === 'session-complete'}
    <SessionComplete onDone={() => { screen = 'home' }} />
  {:else if screen === 'calibrate'}
    <Calibration
      onComplete={(range) => { pendingRange = range; screen = 'calibrate-confirm' }}
      onCancel={() => { screen = 'home' }}
    />
  {:else if screen === 'calibrate-confirm' && pendingRange}
    <CalibrationConfirm
      range={pendingRange}
      onConfirm={() => { targetPitchRange.set(pendingRange); screen = 'home' }}
      onRecalibrate={() => { screen = 'calibrate' }}
    />
  {:else if screen === 'edit-words'}
    <WordListEditor onDone={() => { screen = 'home' }} />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    background: #0f172a;
    color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100dvh;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
</style>
