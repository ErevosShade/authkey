import {
  Sun, Moon,
  Globe, Lock, LockOpen, Shield,
  Settings, Clock, Trash2, ChevronLeft, Plus,
  type LucideProps,
} from "lucide-react";

export { Sun, Moon };

type P = Omit<LucideProps, "size">;

export const GlobeIcon   = (p: P) => <Globe       {...p} size={13} />;
export const LockIcon    = (p: P) => <Lock        {...p} size={8}  />;
export const UnlockIcon  = (p: P) => <LockOpen    {...p} size={8}  />;
export const ShieldIcon  = (p: P) => <Shield      {...p} size={10} />;
export const GearIcon    = (p: P) => <Settings    {...p} size={12} />;
export const ClockIcon   = (p: P) => <Clock       {...p} size={11} />;
export const TrashIcon   = (p: P) => <Trash2      {...p} size={10} />;
export const BackIcon    = (p: P) => <ChevronLeft {...p} size={11} />;
export const PlusIcon    = (p: P) => <Plus        {...p} size={10} />;