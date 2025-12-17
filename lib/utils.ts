import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return 'Fecha no disponible';

  const d = new Date(date);

  // Check if date is invalid
  if (isNaN(d.getTime())) {
    return 'Fecha inválida';
  }

  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  if (!date) return 'Fecha no disponible';

  const d = new Date(date);

  // Check if date is invalid
  if (isNaN(d.getTime())) {
    return 'Fecha inválida';
  }

  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: string | Date): string {
  if (!date) return '--:--';

  const d = new Date(date);

  // Check if date is invalid
  if (isNaN(d.getTime())) {
    return '--:--';
  }

  return d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
