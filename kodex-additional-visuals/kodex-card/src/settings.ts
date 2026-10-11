import { formattingSettings, FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

export class VisualFormattingSettingsModel extends formattingSettings.Model {
  style = new StyleCard();
  labels = new LabelsCard();
  interaction = new InteractionCard();
  cards = [this.style, this.labels, this.interaction];
}
class StyleCard extends formattingSettings.SimpleCard {
  name="style"; displayName="KODEX · Estilo";
  background=new formattingSettings.ColorPicker({name:"background",displayName:"Fondo",value:{value:"#0B1020"}});
  backgroundOpacity=new formattingSettings.NumUpDown({name:"backgroundOpacity",displayName:"Opacidad del fondo",value:100});
  borderColor=new formattingSettings.ColorPicker({name:"borderColor",displayName:"Borde",value:{value:"#26304A"}});
  borderWidth=new formattingSettings.NumUpDown({name:"borderWidth",displayName:"Grosor del borde",value:1});
  radius=new formattingSettings.NumUpDown({name:"radius",displayName:"Radio",value:16});
  primaryColor=new formattingSettings.ColorPicker({name:"primaryColor",displayName:"Color primario",value:{value:"#8B5CF6"}});
  secondaryColor=new formattingSettings.ColorPicker({name:"secondaryColor",displayName:"Color secundario",value:{value:"#22D3EE"}});
  positiveColor=new formattingSettings.ColorPicker({name:"positiveColor",displayName:"Positivo",value:{value:"#22C55E"}});
  negativeColor=new formattingSettings.ColorPicker({name:"negativeColor",displayName:"Negativo",value:{value:"#EF4444"}});
  textColor=new formattingSettings.ColorPicker({name:"textColor",displayName:"Texto",value:{value:"#F8FAFC"}});
  mutedColor=new formattingSettings.ColorPicker({name:"mutedColor",displayName:"Texto secundario",value:{value:"#94A3B8"}});
  fontSize=new formattingSettings.NumUpDown({name:"fontSize",displayName:"Tamaño base",value:12});
  shadow=new formattingSettings.ToggleSwitch({name:"shadow",displayName:"Sombra",value:true});
  glow=new formattingSettings.ToggleSwitch({name:"glow",displayName:"Glow",value:true});
  slices=[this.background,this.backgroundOpacity,this.borderColor,this.borderWidth,this.radius,this.primaryColor,this.secondaryColor,this.positiveColor,this.negativeColor,this.textColor,this.mutedColor,this.fontSize,this.shadow,this.glow];
}
class LabelsCard extends formattingSettings.SimpleCard {
  name="labels"; displayName="KODEX · Etiquetas";
  show=new formattingSettings.ToggleSwitch({name:"show",displayName:"Mostrar etiquetas",value:true});
  showValues=new formattingSettings.ToggleSwitch({name:"showValues",displayName:"Mostrar valores",value:true});
  showLegend=new formattingSettings.ToggleSwitch({name:"showLegend",displayName:"Mostrar leyenda",value:true});
  slices=[this.show,this.showValues,this.showLegend];
}
class InteractionCard extends formattingSettings.SimpleCard {
  name="interaction"; displayName="KODEX · Interacción";
  enableSelection=new formattingSettings.ToggleSwitch({name:"enableSelection",displayName:"Selección Power BI",value:true});
  enableHover=new formattingSettings.ToggleSwitch({name:"enableHover",displayName:"Hover",value:true});
  enableAnimation=new formattingSettings.ToggleSwitch({name:"enableAnimation",displayName:"Animación",value:true});
  slices=[this.enableSelection,this.enableHover,this.enableAnimation];
}
export { FormattingSettingsService };
