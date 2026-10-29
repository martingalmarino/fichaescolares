import json,os
from playwright.sync_api import sync_playwright
C=[("#4aa3df","#eef7fd","#2b86c4"),("#f4a531","#fff4e2","#c77f0f"),("#1d3557","#e8edf5","#1d3557")]
css=open("cards.css").read()
def word(w,a,lab):
    return f'<div class="w" style="background:{C[a][1]}"><b style="color:{C[a][0]}">{w[:lab]}</b>{w[lab:]}</div>'
def dots(n):
    def frame(k): return '<div class="tf">'+''.join(f'<i class="{"on" if i<k else ""}"></i>' for i in range(10))+'</div>'
    return '<div class="tfw">'+frame(min(n,10))+(frame(n-10) if n>10 else '')+'</div>'
AB=[("A","avión"),("B","barco"),("C","casa"),("D","dedo"),("E","elefante"),("F","flor"),("G","gato"),("H","helado"),("I","isla"),("J","jirafa"),("K","kiwi"),("L","luna"),("M","mano"),("N","nube"),("Ñ","ñandú"),("O","oso"),("P","pelota"),("Q","queso"),("R","ratón"),("S","sol"),("T","tren"),("U","uva"),("V","vaca"),("W","wafle"),("X","xilofón"),("Y","yacaré"),("Z","zapato")]
NUM="uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte".split()
VOC=[("A","avión · abeja · árbol"),("E","elefante · escoba · estrella"),("I","isla · iglú · imán"),("O","oso · ojo · ola"),("U","uva · uno · uña")]
SIL=[("m","mesa"),("p","pato"),("s","sopa"),("l","luna"),("t","torta"),("n","nido"),("d","dedo"),("f","foca"),("b","bote"),("r","rosa"),("v","vela"),("j","jugo"),("ñ","ñandú"),("ll","lluvia"),("ch","chupetín"),("y","yema")]
COL=[("rojo","#d62828"),("azul","#1f5fbf"),("amarillo","#f7d23e"),("verde","#2e9e4f"),("naranja","#f28c28"),("violeta","#7b4bb7"),("rosa","#f29ac0"),("celeste","#7cc6f2"),("marrón","#8b5a2b"),("negro","#111111"),("blanco","#ffffff"),("gris","#9aa0a6")]
FOR=[("círculo","circle(50%)"),("cuadrado","inset(0)"),("triángulo","polygon(50% 0,100% 100%,0 100%)"),("rectángulo","R"),("óvalo","ellipse(50% 32% at 50% 50%)"),("rombo","polygon(50% 0,100% 50%,50% 100%,0 50%)"),("estrella","polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"),("hexágono","polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%)")]
DIAS=["lunes","martes","miércoles","jueves","viernes","sábado","domingo"]
MES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
def S():
    out={}
    out["abecedario"]=("Tarjetas del abecedario","27 tarjetas con mayúscula, minúscula y una palabra de ejemplo. Incluye la Ñ.",
      [lambda a,L=L,w=w:f'<div class="L">{L}<span>{L.lower()}</span></div>'+word(w,a,1) for L,w in AB],"AÑZ")
    out["numeros-1-al-20"]=("Tarjetas de números del 1 al 20","20 tarjetas con el número, su nombre escrito y puntos para contar en cuadros de diez.",
      [lambda a,i=i,w=w:f'<div class="L sm">{i}</div><div class="nw">{w}</div>'+dots(i) for i,w in enumerate(NUM,1)],["1","10","20"])
    out["vocales"]=("Tarjetas de las vocales","5 tarjetas grandes con mayúscula, minúscula y tres palabras de ejemplo, más tarjetas para completar.",
      [lambda a,L=L,w=w:f'<div class="L xl">{L}<span>{L.lower()}</span></div><div class="ex">{w}</div>' for L,w in VOC],"AEI")
    out["silabas"]=("Tarjetas de sílabas directas","16 familias de sílabas en imprenta mayúscula y minúscula, con una palabra de ejemplo.",
      [lambda a,c=c,w=w:'<div class="sy">'+''.join(f'<span>{(c+v).upper()}</span>' for v in "aeiou")+'</div><div class="sy lo">'+''.join(f'<span>{c+v}</span>' for v in "aeiou")+'</div>'+word(w,a,len(c)) for c,w in SIL],["MA","PA","SA"])
    out["colores-y-formas"]=("Tarjetas de colores y formas","12 colores y 8 figuras geométricas con su nombre, para nombrar, clasificar y jugar.",
      [lambda a,n=n,h=h:f'<div class="sw" style="background:{h}"></div><div class="nw b">{n}</div>' for n,h in COL]+
      [lambda a,n=n,p=p:(f'<div class="sh rect" style="background:{C[a][0]}"></div>' if p=="R" else f'<div class="sh" style="background:{C[a][0]};clip-path:{p}"></div>')+f'<div class="nw b">{n}</div>' for n,p in FOR],["●","■","▲"])
    out["dias-y-meses"]=("Tarjetas de los días de la semana y los meses del año","7 días y 12 meses en tarjetas grandes, numerados en orden, para armar la rutina y el calendario del aula.",
      [lambda a,d=d,i=i:f'<div class="tag">Día {i} de la semana</div><div class="big">{d}</div><div class="ab">{d[:3].upper()}</div>' for i,d in enumerate(DIAS,1)]+
      [lambda a,m=m,i=i:f'<div class="tag">Mes {i} del año</div><div class="big">{m}</div><div class="ab">{m[:3].upper()}</div>' for i,m in enumerate(MES,1)],["LUN","MAR","ENE"])
    return out
BR='<div class="br"><b>Aulita</b>aulita.com.ar</div>'
def blank(a):
    return f'<div class="c"><div class="in bl" style="border-color:{C[a][0]}"><div class="bar" style="background:{C[a][0]}"></div><div class="mt" style="color:{C[a][2]}">Mi tarjeta</div><div class="bx"></div><div class="lb">Escribí tu palabra</div><div class="rg"></div><div class="rg"></div>{BR}</div></div>'
def build(slug,title,sub,cards,mini):
    n=len(cards);pages=[cards[i:i+8] for i in range(0,n,8)]
    h=f"<html><head><meta charset=utf-8><style>{css}</style></head><body>"
    h+=f'<div class="pg cv"><div class="logo">Aulita</div><h1>{title}</h1><p>{sub}</p><div class="mini">'+''.join(f'<div style="border-color:{C[i][0]}">{l}</div>' for i,l in enumerate(mini))
    h+='</div><div class="tips"><b>Cómo usarlas</b><br>1. Imprimí en A4, a color o en blanco y negro.<br>2. Recortá por la línea punteada.<br>3. Si querés que duren, pegalas en cartulina o plastificalas.<br>4. Usá las tarjetas «Mi tarjeta» para que cada chico arme la suya.</div><div class="ft cvf"><span>Material gratuito para el aula y la casa</span><b>aulita.com.ar</b></div></div>'
    for p,ch in enumerate(pages):
        h+=f'<div class="pg"><div class="hd"><b>{title}</b><span>Recortá por la línea punteada</span></div><div class="g">'
        for j,f in enumerate(ch):
            k=p*8+j;a=k%3
            h+=f'<div class="c"><div class="in" style="border-color:{C[a][0]}"><div class="bar" style="background:{C[a][0]}"></div>{f(a)}{BR}<div class="n">{k+1}/{n}</div></div></div>'
        for q in range(8-len(ch)): h+=blank((p*8+len(ch)+q)%3)
        h+=f'</div><div class="ft"><span>Página {p+1} de {len(pages)}</span><b>aulita.com.ar</b></div></div>'
    return h+"</body></html>",n,len(pages)
meta={}
with sync_playwright() as s:
    b=s.chromium.launch();pg=b.new_page()
    for slug,(t,sub,cards,mini) in S().items():
        h,n,np=build(slug,t,sub,cards,mini)
        open(f"html/{slug}.html","w").write(h)
        pg.goto(f"file://{os.getcwd()}/html/{slug}.html");pg.wait_for_timeout(300)
        # clipping check: any element overflowing its card
        clip=pg.evaluate("""()=>[...document.querySelectorAll('.in')].filter(c=>{const r=c.getBoundingClientRect();return [...c.querySelectorAll('*')].some(e=>{const q=e.getBoundingClientRect();return q.width&&(q.left<r.left-1||q.right>r.right+1||q.top<r.top-1||q.bottom>r.bottom+1)})||c.scrollHeight>c.clientHeight+1}).length""")
        pg.pdf(path=f"pdf/tarjetas-{slug}-aulita.pdf",format="A4",print_background=True)
        meta[slug]=dict(title=t,cards=n,pages=np+1,overflowing_cards=clip)
    b.close()
json.dump(meta,open("sets.json","w"),ensure_ascii=False,indent=1);print(json.dumps(meta,ensure_ascii=False,indent=1))
