import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import ISelectionId = powerbi.visuals.ISelectionId;
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

interface Item {
    label: string;
    selectionId: ISelectionId;
    index: number;
}

export class Visual implements IVisual {
    private host: IVisualHost;
    private root: HTMLElement;
    private trigger: HTMLElement;
    private valueEl: HTMLElement;
    private countEl: HTMLElement;
    private menu: HTMLElement;
    private search: HTMLInputElement;
    private optionsEl: HTMLElement;
    private settings: VisualFormattingSettingsModel = new VisualFormattingSettingsModel();
    private items: Item[] = [];
    private selected = new Set<number>();
    private open = false;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.root = document.createElement("div");
        this.root.className = "kodex-dropdown";

        this.trigger = document.createElement("div");
        this.trigger.className = "kodex-trigger";

        this.valueEl = document.createElement("div");
        this.valueEl.className = "kodex-value";

        this.countEl = document.createElement("div");
        this.countEl.className = "kodex-count";

        const chevron = document.createElement("div");
        chevron.className = "kodex-chevron";
        chevron.textContent = "⌄";
        chevron.dataset.role = "chevron";

        this.trigger.appendChild(this.valueEl);
        this.trigger.appendChild(this.countEl);
        this.trigger.appendChild(chevron);

        this.menu = document.createElement("div");
        this.menu.className = "kodex-menu";

        this.search = document.createElement("input");
        this.search.className = "kodex-search";
        this.search.type = "text";
        this.search.placeholder = "Buscar…";

        this.optionsEl = document.createElement("div");
        this.optionsEl.className = "kodex-options";

        this.menu.appendChild(this.search);
        this.menu.appendChild(this.optionsEl);

        this.root.appendChild(this.trigger);
        this.root.appendChild(this.menu);
        options.element.appendChild(this.root);

        this.trigger.addEventListener("click", () => {
            this.open = !this.open;
            this.renderOpenState();
        });

        this.search.addEventListener("input", () => this.renderOptions(this.search.value));

        document.addEventListener("click", (event) => {
            if (!this.root.contains(event.target as Node)) {
                this.open = false;
                this.renderOpenState();
            }
        });
    }

    public update(options: VisualUpdateOptions) {
        this.settings = this.getSettings(options.dataViews?.[0]);
        this.applyStyle();

        const categorical = options.dataViews?.[0]?.categorical;
        const categories = categorical?.categories?.[0];

        this.items = [];
        if (categories) {
            const values = categories.values || [];
            const identities = categories.identity || [];

            for (let i = 0; i < values.length; i++) {
                const label = this.formatValue(values[i], categories.source?.type?.category);
                const selectionId = this.host.createSelectionIdBuilder()
                    .withCategory(categories, i)
                    .createSelectionId();
                this.items.push({ label, selectionId, index: i });
            }
        }

        this.selected.clear();
        this.renderOptions(this.search.value || "");
        this.updateValue();
        this.renderOpenState();
    }

    private formatValue(value: any, type: any): string {
        if (value === null || value === undefined) return "(Blank)";
        if (value instanceof Date) return value.toLocaleDateString();
        return String(value);
    }

    private selectItem(item: Item, event: MouseEvent) {
        const multi = this.settings.dropdown.multiSelect.value;
        if (multi) {
            const next = new Set(this.selected);
            if (next.has(item.index)) next.delete(item.index);
            else next.add(item.index);
            this.selected = next;
            this.host.createSelectionManager().select(
                Array.from(this.selected).map(i => this.items[i].selectionId),
                true
            );
        } else {
            this.selected = new Set([item.index]);
            this.host.createSelectionManager().select(item.selectionId, false);
            this.open = false;
        }

        this.renderOptions(this.search.value || "");
        this.updateValue();
        this.renderOpenState();
        event.stopPropagation();
    }

    private renderOptions(query: string) {
        this.optionsEl.innerHTML = "";
        const q = query.trim().toLocaleLowerCase();

        for (const item of this.items) {
            if (q && !item.label.toLocaleLowerCase().includes(q)) continue;

            const row = document.createElement("div");
            row.className = "kodex-option";
            row.style.padding = `${this.settings.dropdown.optionPadding.value}px 12px`;
            row.style.color = this.selected.has(item.index)
                ? this.settings.accent.selectedTextColor.value.value
                : this.settings.text.textColor.value.value;
            row.style.background = this.selected.has(item.index)
                ? this.settings.accent.selectedBackground.value.value
                : "transparent";

            const check = document.createElement("span");
            check.className = "kodex-check";
            check.textContent = this.selected.has(item.index) ? "✓" : "";

            const text = document.createElement("span");
            text.className = "kodex-option-text";
            text.textContent = item.label;

            row.appendChild(check);
            row.appendChild(text);
            row.addEventListener("mouseenter", () => {
                if (!this.selected.has(item.index)) {
                    row.style.background = this.settings.accent.hoverBackground.value.value;
                }
            });
            row.addEventListener("mouseleave", () => {
                if (!this.selected.has(item.index)) row.style.background = "transparent";
            });
            row.addEventListener("click", (e) => this.selectItem(item, e as MouseEvent));
            this.optionsEl.appendChild(row);
        }
    }

    private updateValue() {
        if (this.selected.size === 0) {
            this.valueEl.textContent = this.items.length ? "Seleccionar…" : "Agrega un campo";
            this.valueEl.style.color = this.settings.text.placeholderColor.value.value;
            this.countEl.textContent = this.settings.dropdown.showCount.value ? `${this.items.length}` : "";
            return;
        }

        const labels = Array.from(this.selected).map(i => this.items[i]?.label).filter(Boolean);
        this.valueEl.textContent = labels.length <= 2 ? labels.join(", ") : `${labels.length} seleccionados`;
        this.valueEl.style.color = this.settings.text.textColor.value.value;
        this.countEl.textContent = this.settings.dropdown.showCount.value ? `${this.items.length}` : "";
    }

    private renderOpenState() {
        this.menu.classList.toggle("open", this.open);
        this.menu.style.top = "calc(100% + 6px)";
        this.menu.style.maxHeight = `${this.settings.dropdown.maxHeight.value}px`;
    }

    private applyStyle() {
        const c = this.settings.container;
        const t = this.settings.text;
        const a = this.settings.accent;
        const d = this.settings.dropdown;

        const opacity = Math.max(0, Math.min(100, c.backgroundOpacity.value)) / 100;
        const shadow = c.shadow.value
            ? `0 12px 30px rgba(0,0,0,${Math.max(0, Math.min(80, c.shadowOpacity.value)) / 100})`
            : "none";

        this.root.style.fontFamily = t.fontFamily.value;
        this.root.style.background = c.background.value.value;
        this.root.style.border = `${c.borderWidth.value}px solid ${c.borderColor.value.value}`;
        this.root.style.borderRadius = `${c.borderRadius.value}px`;
        this.root.style.boxShadow = shadow;
        this.root.style.opacity = "1";

        this.trigger.style.fontSize = `${t.fontSize.value}px`;
        this.trigger.style.fontWeight = t.fontWeight.value;
        this.trigger.style.color = t.textColor.value.value;
        this.trigger.style.borderRadius = `${c.borderRadius.value}px`;

        this.menu.style.background = c.background.value.value;
        this.menu.style.border = `${Math.max(1, c.borderWidth.value)}px solid ${c.borderColor.value.value}`;
        this.menu.style.borderRadius = `${Math.max(8, c.borderRadius.value)}px`;
        this.menu.style.boxShadow = shadow;
        this.menu.style.maxHeight = `${d.maxHeight.value}px`;

        this.search.style.display = d.showSearch.value ? "block" : "none";
        this.search.style.color = t.textColor.value.value;
        this.search.style.background = c.background.value.value;
        this.search.style.border = `1px solid ${c.borderColor.value.value}`;
        this.search.style.borderRadius = `${Math.max(6, c.borderRadius.value - 4)}px`;
        this.search.style.fontFamily = t.fontFamily.value;

        const chevron = this.root.querySelector('[data-role="chevron"]') as HTMLElement | null;
        if (chevron) {
            chevron.style.display = d.showChevron.value ? "block" : "none";
            chevron.style.color = a.accentColor.value.value;
        }
    }

    private getSettings(dataView?: DataView): VisualFormattingSettingsModel {
        const model = new VisualFormattingSettingsModel();
        if (!dataView?.metadata?.objects) return model;

        const objects: any = dataView.metadata.objects;
        const read = (obj: string, prop: string, fallback: any) =>
            objects[obj]?.[prop] !== undefined ? objects[obj][prop] : fallback;

        model.container.background.value = { value: read("container", "background", "#171A22") };
        model.container.backgroundOpacity.value = read("container", "backgroundOpacity", 100);
        model.container.borderColor.value = { value: read("container", "borderColor", "#343A4A") };
        model.container.borderWidth.value = read("container", "borderWidth", 1);
        model.container.borderRadius.value = read("container", "borderRadius", 12);
        model.container.shadow.value = read("container", "shadow", true);
        model.container.shadowOpacity.value = read("container", "shadowOpacity", 28);

        model.text.textColor.value = { value: read("text", "textColor", "#F7F8FC") };
        model.text.placeholderColor.value = { value: read("text", "placeholderColor", "#9AA3B2") };
        model.text.fontSize.value = read("text", "fontSize", 13);
        model.text.fontFamily.value = read("text", "fontFamily", "Segoe UI");
        model.text.fontWeight.value = read("text", "fontWeight", "600");

        model.accent.accentColor.value = { value: read("accent", "accentColor", "#7C6CFF") };
        model.accent.hoverBackground.value = { value: read("accent", "hoverBackground", "#242A39") };
        model.accent.selectedBackground.value = { value: read("accent", "selectedBackground", "#2B2851") };
        model.accent.selectedTextColor.value = { value: read("accent", "selectedTextColor", "#FFFFFF") };

        model.dropdown.showSearch.value = read("dropdown", "showSearch", true);
        model.dropdown.showCount.value = read("dropdown", "showCount", true);
        model.dropdown.multiSelect.value = read("dropdown", "multiSelect", false);
        model.dropdown.maxHeight.value = read("dropdown", "maxHeight", 260);
        model.dropdown.optionPadding.value = read("dropdown", "optionPadding", 10);
        model.dropdown.showChevron.value = read("dropdown", "showChevron", true);

        return model;
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        const formattingSettingsService = new formattingSettings.Model;
        return formattingSettingsService.buildFormattingModel(this.settings);
    }

    public destroy(): void {}
}
