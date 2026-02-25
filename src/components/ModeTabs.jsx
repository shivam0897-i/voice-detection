import { Radio, Play } from 'lucide-react';

const MODES = {
  REALTIME: 'realtime',
  LEGACY: 'legacy',
};

const ModeTabs = ({ mode, onModeChange, loading }) => {
  const isRealtime = mode === MODES.REALTIME;

  return (
    <div>
      <div className="mode-tabs" role="tablist" aria-label="Analysis mode">
        <button
          type="button"
          role="tab"
          id="tab-realtime"
          aria-selected={isRealtime}
          aria-controls="panel-main"
          onClick={() => onModeChange(MODES.REALTIME)}
          disabled={loading}
          className={`mode-tab ${isRealtime ? 'active' : ''}`}
        >
          <Radio size={15} aria-hidden="true" />
          Realtime
        </button>
        <button
          type="button"
          role="tab"
          id="tab-legacy"
          aria-selected={!isRealtime}
          aria-controls="panel-main"
          onClick={() => onModeChange(MODES.LEGACY)}
          disabled={loading}
          className={`mode-tab ${!isRealtime ? 'active' : ''}`}
        >
          <Play size={15} aria-hidden="true" />
          One-Shot
        </button>
      </div>
      <p className="mode-description">
        {isRealtime
          ? 'Stream audio in chunks for progressive risk scoring, live threat alerts, and behavioral escalation tracking.'
          : 'Upload a complete audio file for a single-pass AI voice detection analysis.'}
      </p>
    </div>
  );
};

export { MODES };
export default ModeTabs;
