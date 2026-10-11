import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionId = powerbi.visuals.ISelectionId;
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

type Point = { label:string; value:number; index:number; id?:ISelectionId; extra?:any[] };
const CHART_TYPE:string="timeline";
const NS="http://www.w3.org/2000/svg";
function svgEl(tag:string, attrs:Record<string,string|number>){const e=document.createElementNS(NS,tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v))); return e;}

export class Visual implements IVisual {
  private root:HTMLElement; private host:any; private selectionManager:any;
  private formattingSettings:VisualFormattingSettingsModel; private formattingSettingsService:FormattingSettingsService; private points:Point[]=[];
  constructor(options:VisualConstructorOptions){
    this.host=options.host; this.selectionManager=this.host.createSelectionManager();
    this.formattingSettingsService=new FormattingSettingsService(this.host.createLocalizationManager());
    this.root=document.createElement("div"); this.root.className="kodex-root"; options.element.appendChild(this.root);
  }
  public update(options:VisualUpdateOptions){
    const dv=options.dataViews?.[0];
    this.formattingSettings=this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel,dv as any);
    const s:any=this.formattingSettings.style, l:any=this.formattingSettings.labels, i:any=this.formattingSettings.interaction;
    this.root.replaceChildren(); this.root.style.setProperty("--k-bg",s.background.value.value); this.root.style.setProperty("--k-border",s.borderColor.value.value);
    this.root.style.setProperty("--k-primary",s.primaryColor.value.value); this.root.style.setProperty("--k-secondary",s.secondaryColor.value.value); this.root.style.setProperty("--k-positive",s.positiveColor.value.value); this.root.style.setProperty("--k-negative",s.negativeColor.value.value); this.root.style.setProperty("--k-text",s.textColor.value.value); this.root.style.setProperty("--k-muted",s.mutedColor.value.value);
    this.root.style.background=s.background.value.value; this.root.style.border=`${s.borderWidth.value}px solid ${s.borderColor.value.value}`; this.root.style.borderRadius=`${s.radius.value}px`; this.root.style.color=s.textColor.value.value; this.root.style.fontSize=`${s.fontSize.value}px`;
    if(s.shadow.value) this.root.style.boxShadow="0 14px 40px rgba(0,0,0,.24)"; if(s.glow.value) this.root.style.filter=`drop-shadow(0 0 12px ${s.primaryColor.value.value}22)`;
    this.points=this.readPoints(dv);
    const title=document.createElement("div"); title.className="kodex-title"; title.textContent="KODEX Timeline"; this.root.appendChild(title);
    const body=document.createElement("div"); body.className="kodex-body"; this.root.appendChild(body);
    const svg=svgEl("svg",{width:"100%",height:"100%",viewBox:"0 0 1000 600",preserveAspectRatio:"none"}) as unknown as SVGSVGElement; body.appendChild(svg);
    this.render(svg,this.points,s,l,i);
  }
  private readPoints(dv:any):Point[]{
    if(!dv) return [];
    if(dv.table?.rows) return dv.table.rows.map((r:any[],idx:number)=>({label:String(r[0]??idx+1),value:Number(r[r.length-1])||0,index:idx,extra:r}));
    const cat=dv.categorical?.categories?.[0]; const vals=dv.categorical?.values?.[0]?.values||[];
    if(!cat) return vals.map((v:any,idx:number)=>({label:String(idx+1),value:Number(v)||0,index:idx}));
    return cat.values.map((v:any,idx:number)=>({label:String(v??idx+1),value:Number(vals[idx])||0,index:idx,id:this.host.createSelectionIdBuilder().withCategory(cat,idx).createSelectionId()}));
  }
  private render(svg:SVGSVGElement,p:Point[],s:any,l:any,i:any){
    const max=Math.max(...p.map(x=>Math.abs(x.value)),1), min=Math.min(...p.map(x=>x.value),0), W=1000,H=600;
    const line=(x1:number,y1:number,x2:number,y2:number,c:string,w:number=2)=>svg.appendChild(svgEl("line",{x1,y1,x2,y2,stroke:c,"stroke-width":w,"stroke-linecap":"round"}));
    const text=(x:number,y:number,t:string,size:number=14,fill:string=s.textColor.value.value,anchor:string="start")=>{const e=svgEl("text",{x,y,fill,"font-size":size,"font-family":"Segoe UI,Inter,Arial","text-anchor":anchor});e.textContent=t;svg.appendChild(e);return e;};
    const rect=(x:number,y:number,w:number,h:number,c:string,rx:number=12)=>{const e=svgEl("rect",{x,y,width:w,height:h,rx,fill:c});svg.appendChild(e);return e;};
    const circle=(x:number,y:number,r:number,c:string)=>{const e=svgEl("circle",{cx:x,cy:y,r,fill:c});svg.appendChild(e);return e;};
    if(CHART_TYPE==="smart-kpi" || CHART_TYPE==="card"){const v=p[0]?.value||0; text(36,120,p[0]?.label||"KPI",22); text(36,245,v.toLocaleString(),64,s.textColor.value.value,"start"); const t=p.length>1?((v-(p[1].value||0))/(Math.abs(p[1].value||1))*100):0; text(38,290,`${t>=0?"↑":"↓"} ${Math.abs(t).toFixed(1)}%`,18,t>=0?s.positiveColor.value.value:s.negativeColor.value.value); const startX=40; for(let n=0;n<Math.min(12,p.length);n++){const x=startX+n*78,y=470-(p[n].value/max)*120; circle(x,y,4,n%2?s.secondaryColor.value.value:s.primaryColor.value.value); if(n) line(x-78,470-(p[n-1].value/max)*120,x,y,n%2?s.secondaryColor.value.value:s.primaryColor.value.value,3);} return;}
    if(CHART_TYPE==="kpi-matrix"){p.slice(0,8).forEach((d,n)=>{const col=n%4,row=Math.floor(n/4),x=20+col*245,y=24+row*270;rect(x,y,220,235,"#111827",16);text(x+18,y+42,d.label,16,s.mutedColor.value.value);text(x+18,y+115,d.value.toLocaleString(),34);text(x+18,y+165,"KODEX KPI",12,s.secondaryColor.value.value);});return;}
    if(CHART_TYPE==="bar"){const n=Math.min(p.length,18),bw=760/Math.max(n,1),base=520; line(80,base,950,base,s.mutedColor.value.value,1); p.slice(0,n).forEach((d,k)=>{const h=Math.max(3,Math.abs(d.value)/max*390),x=90+k*bw+8,y=base-h; const r=rect(x,y,Math.max(8,bw-16),h,k%2?s.secondaryColor.value.value:s.primaryColor.value.value,8); r.style.cursor="pointer"; this.bind(r,d,i); if(l.show.value) text(x+bw/2,y-12,d.label,12,s.textColor.value.value,"middle"); if(l.showValues.value) text(x+bw/2,base+28,d.value.toLocaleString(),11,s.mutedColor.value.value,"middle");});return;}
    if(CHART_TYPE==="trend"){const n=Math.max(2,Math.min(p.length,24)); const pts=p.slice(0,n).map((d,k)=>[60+k*(880/(n-1)),470-(d.value/max)*380] as [number,number]); line(60,470,940,470,s.mutedColor.value.value,1); let path="M "+pts.map(a=>a.join(" ")).join(" L "); const pe=svgEl("path",{d:path,fill:"none",stroke:s.primaryColor.value.value,"stroke-width":6,"stroke-linecap":"round","stroke-linejoin":"round"});svg.appendChild(pe);pts.forEach((a,k)=>{circle(a[0],a[1],6,k%2?s.secondaryColor.value.value:s.primaryColor.value.value);if(l.show.value)text(a[0],510,p[k].label,11,s.mutedColor.value.value,"middle");});return;}
    if(CHART_TYPE==="donut"){const total=p.reduce((a,d)=>a+Math.abs(d.value),0)||1;let a=-Math.PI/2;const cx=500,cy=300,r=190,ri=115;p.slice(0,10).forEach((d,k)=>{const da=Math.abs(d.value)/total*Math.PI*2;const x1=cx+r*Math.cos(a),y1=cy+r*Math.sin(a),x2=cx+r*Math.cos(a+da),y2=cy+r*Math.sin(a+da),ix1=cx+ri*Math.cos(a),iy1=cy+ri*Math.sin(a),ix2=cx+ri*Math.cos(a+da),iy2=cy+ri*Math.sin(a+da),large=da>Math.PI?1:0;const path=`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ri} ${ri} 0 ${large} 0 ${ix1} ${iy1} Z`;const e=svgEl("path",{d:path,fill:k%2?s.secondaryColor.value.value:s.primaryColor.value.value});svg.appendChild(e);a+=da;});text(cx,cy-8,(total).toLocaleString(),30,s.textColor.value.value,"middle");text(cx,cy+28,"Total",13,s.mutedColor.value.value,"middle");return;}
    if(CHART_TYPE==="progress"||CHART_TYPE==="gauge"){const v=Math.max(0,Math.min(100,p[0]?.value||0));const cx=500,cy=330,r=190; const start=-Math.PI*.8,end=Math.PI*.8; const a=end-start,ang=start+a*(v/100); const arc=(r1:number,a1:number,a2:number)=>{const x1=cx+r1*Math.cos(a1),y1=cy+r1*Math.sin(a1),x2=cx+r1*Math.cos(a2),y2=cy+r1*Math.sin(a2);const large=Math.abs(a2-a1)>Math.PI?1:0;const e=svgEl("path",{d:`M ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2}`,fill:"none",stroke:s.mutedColor.value.value,"stroke-width":28,"stroke-linecap":"round"});svg.appendChild(e);const f=svgEl("path",{d:`M ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2}`,fill:"none",stroke:s.primaryColor.value.value,"stroke-width":28,"stroke-linecap":"round"});svg.appendChild(f);};arc(r,start,end);const e=svgEl("path",{d:`M ${cx+r*Math.cos(start)} ${cy+r*Math.sin(start)} A ${r} ${r} 0 ${Math.abs(ang-start)>Math.PI?1:0} 1 ${cx+r*Math.cos(ang)} ${cy+r*Math.sin(ang)}`,fill:"none",stroke:s.primaryColor.value.value,"stroke-width":28,"stroke-linecap":"round"});svg.appendChild(e);text(cx,cy+10,v.toFixed(1)+"%",54,s.textColor.value.value,"middle");text(cx,cy+52,p[0]?.label||"Meta",15,s.mutedColor.value.value,"middle");return;}
    if(CHART_TYPE==="funnel"){const n=Math.min(p.length,8);p.slice(0,n).forEach((d,k)=>{const w=820-k*82,x=(1000-w)/2,y=35+k*64;const r=rect(x,y,w,48,k%2?s.secondaryColor.value.value:s.primaryColor.value.value,10);this.bind(r,d,i);text(500,y+30,`${d.label}  ·  ${d.value.toLocaleString()}`,14,s.textColor.value.value,"middle");});return;}
    if(CHART_TYPE==="waterfall"){let total=0;p.slice(0,16).forEach((d,k)=>{const x=60+k*55, v=d.value, h=Math.abs(v)/max*300, y=v>=0?310-h:310;rect(x,y,34,h,v>=0?s.positiveColor.value.value:s.negativeColor.value.value,7);if(k)line(x-22,310,x,310,s.mutedColor.value.value,1);text(x+17,360,d.label,10,s.mutedColor.value.value,"middle");total+=v;});text(40,70,"Resultado",14,s.mutedColor.value.value);text(40,108,total.toLocaleString(),34,s.textColor.value.value);return;}
    if(CHART_TYPE==="radar"){const n=Math.max(3,Math.min(8,p.length)),cx=500,cy=300,r=210;for(let ring=1;ring<=3;ring++){let pts="";for(let k=0;k<n;k++){const a=-Math.PI/2+k*2*Math.PI/n;pts+=`${cx+Math.cos(a)*r*ring/3},${cy+Math.sin(a)*r*ring/3} `;}const poly=svgEl("polygon",{points:pts,fill:"none",stroke:s.mutedColor.value.value,"stroke-width":1});svg.appendChild(poly);}let pts="";p.slice(0,n).forEach((d,k)=>{const a=-Math.PI/2+k*2*Math.PI/n,rr=Math.abs(d.value)/max*r;pts+=`${cx+Math.cos(a)*rr},${cy+Math.sin(a)*rr} `;text(cx+Math.cos(a)*(r+28),cy+Math.sin(a)*(r+28),d.label,11,s.mutedColor.value.value,"middle");});svg.appendChild(svgEl("polygon",{points:pts,fill:s.primaryColor.value.value+"33",stroke:s.primaryColor.value.value,"stroke-width":3}));return;}
    if(CHART_TYPE==="treemap"){let x=20,y=30;const total=p.reduce((a,d)=>a+Math.abs(d.value),0)||1;p.slice(0,16).forEach((d,k)=>{const w=Math.max(80,900*Math.abs(d.value)/total),h=120+(k%3)*40;if(x+w>980){x=20;y+=180;}const r=rect(x,y,Math.min(w,950-x),h,k%2?s.secondaryColor.value.value:s.primaryColor.value.value,12);this.bind(r,d,i);text(x+12,y+28,d.label,13);text(x+12,y+55,d.value.toLocaleString(),18);x+=Math.min(w,950-x)+10;});return;}
    if(CHART_TYPE==="heatmap"||CHART_TYPE==="calendar"){const n=Math.min(70,p.length||35),cols=7,cw=118,ch=58;p.slice(0,n).forEach((d,k)=>{const x=20+(k%cols)*cw,y=30+Math.floor(k/cols)*ch,op=.15+.85*Math.abs(d.value)/max;const r=rect(x,y,cw-10,ch-10,k%2?s.secondaryColor.value.value:s.primaryColor.value.value,8);r.setAttribute("fill-opacity",String(op));if(l.show.value)text(x+8,y+22,d.label,10);if(l.showValues.value)text(x+8,y+45,d.value.toLocaleString(),12);});return;}
    if(CHART_TYPE==="timeline"){line(70,300,930,300,s.mutedColor.value.value,3);p.slice(0,12).forEach((d,k)=>{const x=80+k*(840/Math.max(1,Math.min(11,p.length-1)));circle(x,300,8,k%2?s.secondaryColor.value.value:s.primaryColor.value.value);line(x,300,x,180+(k%3)*35,k%2?s.secondaryColor.value.value:s.primaryColor.value.value,3);text(x,150+(k%3)*35,d.label,12,s.textColor.value.value,"middle");text(x,330,d.value.toLocaleString(),11,s.mutedColor.value.value,"middle");});return;}
    if(CHART_TYPE==="sankey"){const rows=(this.points as Point[]);const n=Math.max(2,Math.min(8,rows.length));rows.slice(0,n).forEach((d,k)=>{const y=70+k*65;rect(40,y,150,38,s.primaryColor.value.value,8);rect(810,y,150,38,s.secondaryColor.value.value,8);const path=svgEl("path",{d:`M 190 ${y+19} C 390 ${y-20} 610 ${y+58} 810 ${y+19}`,fill:"none",stroke:k%2?s.secondaryColor.value.value:s.primaryColor.value.value,"stroke-opacity":".35","stroke-width":Math.max(3,Math.abs(d.value)/max*22)});svg.appendChild(path);text(48,y+25,d.label,12);text(818,y+25,(d.extra?.[1]??d.label).toString(),12);});return;}
    if(CHART_TYPE==="bubble-matrix"||CHART_TYPE==="scatter"){p.slice(0,60).forEach((d,k)=>{const x=80+(k%10)*92,y=520-(Math.abs(d.value)/max)*440;const r=circle(x,y,5+Math.abs(d.value)/max*22,k%2?s.secondaryColor.value.value:s.primaryColor.value.value);this.bind(r,d,i);if(l.show.value)text(x,570,d.label,10,s.mutedColor.value.value,"middle");});line(60,520,950,520,s.mutedColor.value.value,1);return;}
    if(CHART_TYPE==="geo"){const cats=dvGeo(this.points);}
    // fallback
    p.slice(0,16).forEach((d,k)=>{const x=60+k*55,h=Math.abs(d.value)/max*360;rect(x,500-h,36,h,k%2?s.secondaryColor.value.value:s.primaryColor.value.value,8);});
  }
  private bind(el:Element,p:Point,i:any){if(!i.enableSelection.value||!p.id)return;el.addEventListener("click",()=>this.selectionManager.select(p.id));el.addEventListener("contextmenu",(ev:any)=>{ev.preventDefault();this.selectionManager.showContextMenu(p.id,{x:ev.clientX,y:ev.clientY});});}
  public getFormattingModel():powerbi.visuals.FormattingModel{return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);}
  public destroy(){this.root.replaceChildren();}
}
function dvGeo(p:Point[]){return p;}
