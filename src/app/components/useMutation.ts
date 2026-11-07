import { useRef, useState } from 'react';
import { toast } from 'sonner';

type Result = { ok: boolean; message?: string };

/** Only acknowledge a write after the server accepted it; block duplicate clicks. */
export function useMutation() {
  const active = useRef(false);
  const [pending, setPending] = useState(false);
  const execute = async <T extends Result>(action: () => Promise<T>): Promise<T | null> => {
    if (active.current) return null;
    active.current = true;
    setPending(true);
    try {
      const result = await action();
      if (!result.ok) toast.error(result.message || 'Сервер не сохранил изменения');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось связаться с сервером');
      return null;
    } finally {
      active.current = false;
      setPending(false);
    }
  };
  return { pending, execute };
}
