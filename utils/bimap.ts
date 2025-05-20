export class BiMap {
  private frontToBack: Map<string, string> = new Map();
  private backToFront: Map<string, string> = new Map();

  constructor(entries?: [string, string][]) {
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  isEmpty(): boolean {
    return this.frontToBack.size === 0;
  }

  set(frontValue: string, backValue: string): void {
    // Eliminar relaciones previas, si existen
    if (this.frontToBack.has(frontValue)) {
      const oldValue = this.frontToBack.get(frontValue)!;
      this.backToFront.delete(oldValue);
    }
    if (this.backToFront.has(backValue)) {
      const oldKey = this.backToFront.get(backValue)!;
      this.frontToBack.delete(oldKey);
    }

    // Crear nueva relación
    this.frontToBack.set(frontValue, backValue);
    this.backToFront.set(backValue, frontValue);
  }

  getBackValue(frontValue: string): string | undefined {
    return this.frontToBack.get(frontValue);
  }

  getFrontValue(backValue: string): string | undefined {
    return this.backToFront.get(backValue);
  }

  delete(frontValue: string): void {
    const backValue = this.frontToBack.get(frontValue);
    if (backValue !== undefined) {
      this.frontToBack.delete(frontValue);
      this.backToFront.delete(backValue);
    }
  }

  deleteValue(backValue: string): void {
    const frontValue = this.backToFront.get(backValue);
    if (frontValue !== undefined) {
      this.backToFront.delete(backValue);
      this.frontToBack.delete(frontValue);
    }
  }

  hasFrontValue(frontValue: string): boolean {
    return this.frontToBack.has(frontValue);
  }

  hasBackValue(backValue: string): boolean {
    return this.backToFront.has(backValue);
  }

  clear(): void {
    this.frontToBack.clear();
    this.backToFront.clear();
  }

  frontValues(): string[] {
    return [...this.backToFront.values()];
  }

  backValues(): string[] {
    return [...this.frontToBack.values()];
  }

  values(): { front: string; back: string }[] {
    const values: { front: string; back: string }[] = [];
    for (const [front, back] of this.frontToBack.entries()) {
      values.push({ front, back });
    }
    return values;
  }
}
