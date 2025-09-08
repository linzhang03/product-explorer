export function truthy<T>(v: T | undefined | null): v is T { 
    return v != null && v !== ''; }

export function toCsv(values: string[]): string {
    return values.filter(Boolean).join(',');
}