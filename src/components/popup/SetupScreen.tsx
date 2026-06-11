import { ShieldFP } from "../shared/ShieldFP";
import { ShieldIcon } from "../shared/icons";

type Props = {
  userId:         string;
  status:         string;
  onUserIdChange: (v: string) => void;
  onRegister:     () => void;
};

export const SetupScreen = ({ userId, status, onUserIdChange, onRegister }: Props) => (
  <div className="flex flex-col items-center">

    {/* Shield + decorative rings */}
    <div className="relative flex items-center justify-center rounded-full flex-shrink-0 mb-[18px] w-24 h-24 bg-surface border border-border">
      <div className="absolute rounded-full pointer-events-none opacity-60 border border-border" style={{ inset: -10 }} />
      <div className="absolute rounded-full pointer-events-none opacity-30 border border-border" style={{ inset: -20 }} />
      <ShieldFP />
    </div>

    <span className="font-mono uppercase tracking-[0.2em] text-[8px] text-ak-accent opacity-80 mb-[7px]">
      WebAuthn · Biometric
    </span>

    <h2 className="font-sans font-semibold text-center text-[17px] leading-tight tracking-[-0.03em] text-text mb-1">
      Set up AuthKey
    </h2>

    <p className="font-mono uppercase tracking-[0.14em] text-[8px] text-text-muted mb-[22px]">
      secure your browsing
    </p>

    <div className="w-full flex flex-col gap-[10px]">
      <div>
        <label className="font-mono uppercase block text-[8px] tracking-[0.16em] text-text-muted mb-[5px]">
          Username
        </label>
        <input
          type="text"
          placeholder="e.g. john_doe"
          value={userId}
          onChange={e => onUserIdChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onRegister()}
          className="w-full rounded-[5px] outline-none transition-colors font-mono text-[11px] tracking-[0.03em] px-[11px] py-[9px] bg-input-bg border border-border text-text-sub"
        />
      </div>

      <button
        onClick={onRegister}
        className="relative w-full flex items-center justify-center gap-[7px] rounded-[5px] font-mono font-bold uppercase overflow-hidden cursor-pointer transition-all text-[9px] tracking-[0.14em] p-[10px] bg-btn-bg border border-btn-border text-text"
      >
        <span className="absolute top-0 left-0 bottom-0 w-0.5 bg-ak-accent" />
        <ShieldIcon color="currentColor" /> Register AuthKey
      </button>
    </div>

    {status && (
      <p className="font-mono text-center text-[9px] tracking-[0.06em] text-text-muted mt-2">
        {status}
      </p>
    )}
  </div>
);