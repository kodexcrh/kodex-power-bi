import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

export class ContainerSettings extends formattingSettings.SimpleCard {
    name = "container";
    displayName = "Contenedor";
    background = new formattingSettings.ColorPicker({
        name: "background", displayName: "Fondo", value: { value: "#171A22" }
    });
    backgroundOpacity = new formattingSettings.NumUpDown({
        name: "backgroundOpacity", displayName: "Opacidad del fondo", value: 100, options: { minValue: { value: 0 }, maxValue: { value: 100 }, unitValue: { value: 1 } }
    });
    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor", displayName: "Color del borde", value: { value: "#343A4A" }
    });
    borderWidth = new formattingSettings.NumUpDown({
        name: "borderWidth", displayName: "Grosor del borde", value: 1, options: { minValue: { value: 0 }, maxValue: { value: 6 }, unitValue: { value: 1 } }
    });
    borderRadius = new formattingSettings.NumUpDown({
        name: "borderRadius", displayName: "Radio de borde", value: 12, options: { minValue: { value: 0 }, maxValue: { value: 40 }, unitValue: { value: 1 } }
    });
    shadow = new formattingSettings.ToggleSwitch({
        name: "shadow", displayName: "Sombra", value: true
    });
    shadowOpacity = new formattingSettings.NumUpDown({
        name: "shadowOpacity", displayName: "Opacidad de sombra", value: 28, options: { minValue: { value: 0 }, maxValue: { value: 80 }, unitValue: { value: 1 } }
    });
}

export class TextSettings extends formattingSettings.SimpleCard {
    name = "text";
    displayName = "Texto";
    textColor = new formattingSettings.ColorPicker({
        name: "textColor", displayName: "Texto", value: { value: "#F7F8FC" }
    });
    placeholderColor = new formattingSettings.ColorPicker({
        name: "placeholderColor", displayName: "Placeholder", value: { value: "#9AA3B2" }
    });
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize", displayName: "Tamaño", value: 13, options: { minValue: { value: 9 }, maxValue: { value: 28 }, unitValue: { value: 1 } }
    });
    fontFamily = new formattingSettings.TextInput({
        name: "fontFamily", displayName: "Familia tipográfica", value: "Segoe UI"
    });
    fontWeight = new formattingSettings.TextInput({
        name: "fontWeight", displayName: "Peso", value: "600"
    });
}

export class AccentSettings extends formattingSettings.SimpleCard {
    name = "accent";
    displayName = "Acento";
    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor", displayName: "Acento", value: { value: "#7C6CFF" }
    });
    hoverBackground = new formattingSettings.ColorPicker({
        name: "hoverBackground", displayName: "Fondo hover", value: { value: "#242A39" }
    });
    selectedBackground = new formattingSettings.ColorPicker({
        name: "selectedBackground", displayName: "Fondo seleccionado", value: { value: "#2B2851" }
    });
    selectedTextColor = new formattingSettings.ColorPicker({
        name: "selectedTextColor", displayName: "Texto seleccionado", value: { value: "#FFFFFF" }
    });
}

export class DropdownSettings extends formattingSettings.SimpleCard {
    name = "dropdown";
    displayName = "Comportamiento";
    showSearch = new formattingSettings.ToggleSwitch({
        name: "showSearch", displayName: "Mostrar búsqueda", value: true
    });
    showCount = new formattingSettings.ToggleSwitch({
        name: "showCount", displayName: "Mostrar cantidad", value: true
    });
    multiSelect = new formattingSettings.ToggleSwitch({
        name: "multiSelect", displayName: "Selección múltiple", value: false
    });
    maxHeight = new formattingSettings.NumUpDown({
        name: "maxHeight", displayName: "Altura máxima del menú", value: 260, options: { minValue: { value: 120 }, maxValue: { value: 700 }, unitValue: { value: 10 } }
    });
    optionPadding = new formattingSettings.NumUpDown({
        name: "optionPadding", displayName: "Espaciado de opciones", value: 10, options: { minValue: { value: 4 }, maxValue: { value: 24 }, unitValue: { value: 1 } }
    });
    showChevron = new formattingSettings.ToggleSwitch({
        name: "showChevron", displayName: "Mostrar flecha", value: true
    });
}

export class VisualFormattingSettingsModel extends formattingSettings.Model {
    container = new ContainerSettings();
    text = new TextSettings();
    accent = new AccentSettings();
    dropdown = new DropdownSettings();

    cards = [
        this.container,
        this.text,
        this.accent,
        this.dropdown
    ];
}
