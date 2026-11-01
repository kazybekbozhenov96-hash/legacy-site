import re,sys,os,json
sys.path.insert(0,os.path.dirname(__file__)); from tr import T,H
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..')); os.chdir(ROOT)
CYR=re.compile('[А-Яа-яЁё]')
LOC={'kz':('kk','kk_KZ',0),'en':('en','en_US',1)}
OWN={'index.html','about.html'}
def rel(v):
    if not v or v.startswith(('#','http:','https:','mailto:','tel:','data:','/','./','../','javascript:')): return v
    return v if v.split('#')[0].split('?')[0] in OWN else '../'+v
SW_CSS='''.lang{display:inline-flex;align-items:center;gap:2px;font-family:var(--mono);font-size:12px;letter-spacing:.06em;margin-left:auto;margin-right:10px}
.lang a{color:inherit;opacity:.55;text-decoration:none;padding:6px 5px;border-radius:4px}.lang a:hover{opacity:1}
.lang a[aria-current]{opacity:1;color:var(--pu)}
@media (max-width:420px){.lang{font-size:11px;margin-right:6px}.lang a{padding:6px 3px}}
'''
def switch(cur,page,depth):
    up='../' if depth else ''
    def href(l):
        p='' if page=='index.html' else page
        if l=='ru': return (up or './')+p if up else './'+p
        return up+l+'/'+p
    lbl={'ru':'RU','kz':'KZ','en':'EN'}
    return '<nav class="lang" aria-label="Язык / Тіл / Language">'+''.join(
        f'<a href="{href(l)}" hreflang="{ {"ru":"ru","kz":"kk","en":"en"}[l]}" lang="{ {"ru":"ru","kz":"kk","en":"en"}[l]}"'+(' aria-current="true"' if l==cur else '')+f'>{lbl[l]}</a>' for l in ('ru','kz','en'))+'</nav>'
def add_switch(s,cur,page,depth):
    s=re.sub(r'<nav class="lang".*?</nav>','',s,flags=re.S)
    s=s.replace('<a class="tel" href="#contacts">', switch(cur,page,depth)+'<a class="tel" href="#contacts">',1) if '<a class="tel" href="#contacts">' in s else re.sub(r'(<a class="tel"[^>]*>)',lambda m:switch(cur,page,depth)+m.group(1),s,count=1)
    if '.lang{display' not in s:
        i=s.rindex('</style>'); s=s[:i]+SW_CSS+s[i:]
    return s
def alt_links(page):
    p='' if page=='index.html' else page
    b='https://legacyrk.kz/'
    return (f'<link rel="alternate" hreflang="ru" href="{b}{p}">\n<link rel="alternate" hreflang="kk" href="{b}kz/{p}">\n'
            f'<link rel="alternate" hreflang="en" href="{b}en/{p}">\n<link rel="alternate" hreflang="x-default" href="{b}{p}">\n')
def translate(src,lang,page):
    code,ogl,k=LOC[lang]
    s=src
    for a,b in H.items(): s=s.replace(a,b[k])
    s=re.sub(r'<script type="application/ld\+json">.*?</script>\n?','',s,flags=re.S)
    s=s.replace('<html lang="ru">',f'<html lang="{code}">',1).replace('content="ru_RU"',f'content="{ogl}"')
    p='' if page=='index.html' else page
    s=re.sub(r'<link rel="canonical" href="[^"]*">',f'<link rel="canonical" href="https://legacyrk.kz/{lang}/{p}">',s)
    s=re.sub(r'<meta property="og:url" content="[^"]*">',f'<meta property="og:url" content="https://legacyrk.kz/{lang}/{p}">',s)
    missing=set()
    def tx(t):
        key=t.strip()
        if not CYR.search(key): return t
        if key not in T: missing.add(key); return t
        return t.replace(key,T[key][k])
    out=[]
    for m in re.finditer(r'(<script\b[^>]*>)(.*?)(</script>)|(<style\b[^>]*>.*?</style>)|([^<]+)|(<[^>]+>)',s,re.S):
        if m.group(2) is not None:
            body=m.group(2)
            def js(q):
                t=q.group(0); inner=t[1:-1]
                if CYR.search(inner):
                    if inner in T: return t[0]+T[inner][k]+t[-1]
                    missing.add(inner); return t
                if re.fullmatch(r'(img|video)/[^\s]+|[a-z0-9-]+\.html',inner) and inner not in OWN: return t[0]+'../'+inner+t[-1]
                return t
            body=re.sub(r'"(?:[^"\\\n]|\\.)*"|\'(?:[^\'\\\n]|\\.)*\'|`(?:[^`\\]|\\.)*`',js,body)
            out.append(m.group(1)+body+m.group(3))
        elif m.group(4): out.append(re.sub(r'url\((["\']?)((?:img|video)/)',r'url(\1../\2',m.group(4)))
        elif m.group(5): out.append(tx(m.group(5)))
        else:
            tag=m.group(6)
            tag=re.sub(r'\b(alt|title|aria-label|content|placeholder|data-name|value|label)="([^"]*)"',lambda a:f'{a.group(1)}="{tx(a.group(2))}"',tag)
            tag=re.sub(r'\b(href|src|poster|srcset)="([^"]*)"',lambda a:f'{a.group(1)}="{rel(a.group(2))}"',tag)
            out.append(tag)
    s=''.join(out)
    s=s.replace('<link rel="canonical"',alt_links(page)+'<link rel="canonical"',1)
    s=add_switch(s,lang,page,1)
    return s,missing
allmiss=set()
for page in ('index.html','about.html'):
    src=open(page,encoding='utf-8').read()
    src=re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n','',src)
    for lang in ('kz','en'):
        s,miss=translate(src,lang,page); allmiss|=miss
        os.makedirs(lang,exist_ok=True); open(f'{lang}/{page}','w',encoding='utf-8').write(s)
    ru=add_switch(src,'ru',page,0)
    ru=ru.replace('<link rel="canonical"',alt_links(page)+'<link rel="canonical"',1)
    open(page,'w',encoding='utf-8').write(ru)
print('missing:',json.dumps(sorted(allmiss),ensure_ascii=False))
