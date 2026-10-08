(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const nameInput = $('name'), error = $('name-error'), scanButton = $('scan-button');
  const overlay = $('scan-overlay'), resultArea = $('result-area'), imageModal = $('image-modal');
  const statusEl = $('scan-status'), percentEl = $('scan-percent'), progressEl = $('progress-fill');
  const moods = [...document.querySelectorAll('.mood')], triggers = [...document.querySelectorAll('.trigger')];
  let mood = 'robot', trigger = '', reroll = 0, current = null, imageBlob = null, imageURL = '', scanning = false, toastTimer = 0;

  const archetypes = [
    {role:'宇宙迟到事务官', identity:'负责给所有迟到找一个能说服星球的理由', abilities:['能把五分钟的迟到讲成跨时空支援','在电梯关门前零点一秒进入另一条时间线','把闹钟按掉后仍能梦见完整的请假流程'], weaknesses:['明明提前出门，却会被一只路边小狗留下开会','每次说“马上到”，导航都在重新计算','无法拒绝“再睡五分钟”的正式提案'], verdicts:['宇宙给你发了通行证，时间给你发了未读消息。','你不是迟到，只是世界到得有点早。']},
    {role:'奶茶店第七位失踪股东', identity:'拥有所有新品的精神股份，但分红通常是一根吸管', abilities:['能从第一口判断这杯奶茶适不适合发朋友圈','在八种甜度里精确选中后悔的那一种','让朋友说好不喝，最后每人端一杯'], weaknesses:['面对“少冰”和“去冰”会产生哲学分歧','永远找不到那张满减券的最后一块拼图'], verdicts:['商业版图很大，实际资产是一杯半价椰椰。','建议把你的股权证明打印在杯套上。']},
    {role:'凌晨三点情绪维修员', identity:'专门修理别人深夜突然弹出的“我没事”提示框', abilities:['隔着一句“哈哈”识别出八层真实情绪','把朋友的崩溃翻译成一条能发群里的表情包','在凌晨三点提供比客服还真诚的售后'], weaknesses:['轮到自己时只会回复“我先睡了”','越劝别人早睡，越知道凌晨四点的天气'], verdicts:['宇宙售后评分五星，维修员本人需要重启。','你把别人哄好了，自己还在加载界面。']},
    {role:'朋友圈气氛审计师', identity:'负责审核每一条“随便发发”背后的精密排版', abilities:['一眼看出九宫格里哪张该站 C 位','能把“吃了”改写成年度情绪大片','通过一个句号预测评论区走势'], weaknesses:['发出去十秒后开始审判自己的标点','删掉文案又觉得空白太有深意'], verdicts:['点赞不是 KPI，但你确实有一套隐形报表。','建议你给自己的草稿箱发一份年终奖。']},
    {role:'空气辩论赛常驻冠军', identity:'对手通常没有报名，但你已经赢得十分完整', abilities:['在洗澡时对三年前的争论完成绝地反击','能用眼神驳回空气提出的无理要求','对一句“随便你”写出十二页判决书'], weaknesses:['真实辩论开始时突然想起要喝水','赢了想象中的全场，却忘了自己进屋拿什么'], verdicts:['空气表示尊重裁决，但不会签字。','你的逻辑满分，现场观众为零。']},
    {role:'外卖宇宙路线规划师', identity:'掌握从“吃什么”到“怎么又点这个”的全部宇宙路径', abilities:['在一百家店里找到唯一一家配送费刚好免掉的','把选餐过程做成严肃的多维决策模型','准确预判朋友会说“我都可以”'], weaknesses:['点完单就想吃隔壁那家','看到“再凑三元”会失去人生方向'], verdicts:['地图已经规划完毕，肚子先自行下单。','你的战略眼光足够开店，执行结果仍是老三样。']},
    {role:'群聊潜水指挥官', identity:'常年在线，却只在关键时刻投下一枚精准表情包', abilities:['不说一句话也能掌握一整个群的剧情','用一个“6”完成跨部门沟通','在99+条消息中定位唯一和自己有关的'], weaknesses:['打好的长篇回复总被“撤回了一条消息”打断','被突然艾特时大脑自动切成飞行模式'], verdicts:['你没退出群聊，你只是成为了群聊的暗物质。','系统检测到你在场，但无法证明你有发言计划。']},
    {role:'明日计划首席建筑师', identity:'擅长建造明天的宏伟蓝图，施工许可证却总在后天', abilities:['用三分钟规划一整年的逆袭路线','给待办事项分出七种优先级','把新笔记本的第一页写得像上市计划'], weaknesses:['计划开始前必须先找一个完美的背景音乐','“明天正式开始”拥有自动续期权限'], verdicts:['蓝图很震撼，工地目前只有一把椅子。','宇宙已批准立项，项目经理还在挑封面。']},
    {role:'平行宇宙前台接待', identity:'每天接待无数个“如果当时我这么说”的平行版本', abilities:['脑补出一个没有冷场的完美聚会','给未发生的对话做逐字复盘','在排队时同时经历三种不同人生'], weaknesses:['现实有人问“在吗”时只回一个“在”','平行宇宙都有结局，本宇宙还在输入中'], verdicts:['你的大脑开了很多窗口，记得给现实留一个。','如果宇宙发工资，你至少领三份。']},
    {role:'赛博寺庙许愿运营', identity:'负责将“随缘吧”翻译成可执行的宇宙工单', abilities:['在转发锦鲤和认真努力之间灵活切换','精准识别今天适不适合许一个小愿望','把一句“求顺利”拆成十二项具体需求'], weaknesses:['许完愿五分钟就想去查进度','总给宇宙提交“最好现在”加急申请'], verdicts:['宇宙收到你的工单，正在排队处理。','你嘴上说随缘，后台已经点了三次催单。']},
    {role:'失物招领部隐藏主管', identity:'主管人类最常见的失踪案件：钥匙、耳机和刚才的想法', abilities:['帮所有人找到东西，除了自己手上的手机','凭直觉翻出半年前失踪的一只袜子','在出门前精准发现缺了最重要的一样'], weaknesses:['找眼镜时常常正戴着眼镜','记得所有密码的格式，却不记得密码'], verdicts:['物品都被找到了，主管的记忆还在路上。','建议给你的脑内搜索框加一个自动补全。']},
    {role:'冷场救援队编外队长', identity:'试图拯救每一段沉默，偶尔顺手制造一段新的', abilities:['在三秒沉默中投放一个完全意想不到的话题','把尴尬讲成一个很有参与感的故事','用一句“我懂”成功让大家更困惑'], weaknesses:['笑点讲完才发现只有自己听懂','一紧张就拿天气当永久备用话题'], verdicts:['现场气氛被你救活，也被你带到了外太空。','你是气氛组，也是气氛组的随机事件。']},
    {role:'宇宙客服转人工专家', identity:'专门替朋友把说不清的委屈转接到人类可以理解的频道', abilities:['用三句话让一场误会成功降噪','听完“其实也没什么”就知道事情很大','从一张表情包里读取完整的情绪说明'], weaknesses:['自己的问题永远提示“请稍后重试”','帮别人解决一切，自己的快递还没去拿'], verdicts:['你的服务态度值得五星，你的下班时间值得被保护。','人工已接通，但人工也需要休息。']},
    {role:'周末消失术练习生', identity:'每周试图抓住周末，周末每周从指缝里准时溜走', abilities:['周五下午规划出三天的精彩人生','在床上完成一场精神层面的远足','同时取消三个约会还让大家觉得合理'], weaknesses:['一眨眼就听见周日晚上的片尾曲','周末最忙的活动是想起还有什么没做'], verdicts:['你的周末不是短，是开了二倍速。','宇宙决定给你补一天，但只补在梦里。']},
    {role:'表面淡定秘密指挥塔', identity:'外表显示“收到”，内部已经召开第十九次紧急会议', abilities:['在心里把所有可能发生的剧情提前演完','用平静的语气下达宇宙级作战命令','对朋友说“没事”时顺便写好三套预案'], weaknesses:['别人一句“我们聊聊”就触发全员集合','预案做太多，真正发生时只会说“啊？”'], verdicts:['外壳像静音模式，内部像跨年倒计时。','宇宙认为你可以适当给自己开个会后假期。']},
    {role:'电子榨菜品鉴委员会长', identity:'负责判定什么内容配得上今天这顿饭', abilities:['在饭凉之前找到最合适的下饭视频','精准切到片头刚结束的地方','用三秒判断一个视频值不值得继续看'], weaknesses:['饭吃完了，视频还在挑','真正想看的内容总在筷子放下之后出现'], verdicts:['你的鉴赏水平很高，饭的温度表示遗憾。','宇宙建议先动筷，再进行内容评审。']},
    {role:'未读消息考古学家', identity:'研究从“我等会回”到“三天过去了”的时间断层', abilities:['从一条消息的标点推断发送者的心理活动','挖出三个月前一条还没回的“哈哈”','把回复草稿在脑内编辑到第七版'], weaknesses:['终于想好怎么回时对方已经换了话题','总以为自己已经回复过了'], verdicts:['考古成果丰硕，发送按钮仍未被触碰。','你的已读和已回之间隔着一个文明。']},
    {role:'人间小事放大镜持有人', identity:'能把一件不起眼的小事看出电影预告片的质感', abilities:['发现路边一朵花的年度最佳镜头','把便利店偶遇讲成连续剧第一集','给平凡的一天找到隐藏彩蛋'], weaknesses:['只记得彩蛋，忘了买原本要买的东西','别人问“然后呢”时剧情其实已经结束'], verdicts:['别人过了一天，你剪出了一部片。','请保持这个技能，人间需要一点花絮。']}
  ];
  const prefixes = {
    robot:['待机中的','低电量的','正在更新的','偶尔掉线的','系统误判的'],
    ruler:['准备登基的','自封的','微服私访的','野心很大的','征服闹钟的'],
    air:['对空气宣战的','脑内连胜的','独自开庭的','无对手夺冠的','正在反驳的'],
    court:['内心举证的','表面无事的','微笑开庭的','持续复议的','心里敲槌的'],
    sleepy:['刚从梦里来的','加载到一半的','迷路到今天的','尚未开机的','和枕头结盟的']
  };
  const moodNotes = {
    robot:'系统检测：你看起来很稳，后台却有十三个标签页在同时刷新。',
    ruler:'系统检测：你有统治世界的气势，今天先从统治待办事项开始。',
    air:'系统检测：你的头脑里刚结束一场无人知晓的精彩辩论。',
    court:'系统检测：表情很平静，脑内书记员已经开始记录。',
    sleepy:'系统检测：意识已上线，灵魂还在等待早餐。'
  };
  const triggerNotes = {
    reply:'消息框里那句打了又删的话，已被系统列为未发表的名作。',
    food:'你对外卖的认真程度，已经足够参加一次战略会议。',
    alarm:'你和闹钟的谈判，宇宙认为双方都没有让步。',
    money:'你的余额提出了独立意见，建议暂时不予采纳。',
    none:'系统扫描了五个选项，发现你本人就是完整题库。'
  };
  const verdictExtras = ['建议保存此档案，以便下次被朋友识破时出示。','宇宙已经盖章，别急着上诉。','这个身份没有编制，但有奇怪的使命感。','本结论未经本人同意，却很难完全否认。','你负责继续离谱，系统负责替你保密。'];
  const rarities = [
    {name:'普通 · 合理异常', color:'#72ede0',weight:38},
    {name:'稀有 · 值得围观', color:'#7eb2ff',weight:30},
    {name:'史诗 · 不太能解释', color:'#b498ff',weight:19},
    {name:'传说 · 宇宙已存档', color:'#ffc987',weight:10},
    {name:'宇宙级异常', color:'#ff94d7',weight:3}
  ];
  function hash(s){let h=2166136261;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0}
  function random(seed){let x=seed||0x6d2b79f5;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
  function pick(arr,rng){return arr[Math.floor(rng()*arr.length)]}
  function cleanName(value){return Array.from(value.normalize('NFKC').replace(/<[^>]*>/g,'').replace(/[\u0000-\u001f\u007f<>]/g,'').replace(/\s+/g,' ').trim()).slice(0,16).join('')}
  function makeResult(name,moodKey,triggerKey,nonce){
    const seed=hash(`${name}|${moodKey}|${triggerKey}|${nonce}`), rng=random(seed), a=pick(archetypes,rng);
    const rarityRoll=rng()*100;let sum=0,rarity=rarities[0];for(const r of rarities){sum+=r.weight;if(rarityRoll<sum){rarity=r;break}}
    const ability=pick(a.abilities,rng),weakness=pick(a.weaknesses,rng),baseVerdict=pick(a.verdicts,rng);
    const chosenExtra=pick(verdictExtras,rng), index=(68+rng()*31.9).toFixed(1)+'%';
    const identity=`${name}，${a.identity}。${triggerKey ? triggerNotes[triggerKey] : moodNotes[moodKey]}`;
    const verdict=`${baseVerdict}${chosenExtra}`;
    return {name,title:`${pick(prefixes[moodKey],rng)}${a.role}`,identity,index,ability,weakness,verdict,rarity,seed,code:String(seed).padStart(10,'0').slice(-8)};
  }
  function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2700)}
  function setMood(next){mood=next;for(const b of moods){const active=b.dataset.mood===next;b.classList.toggle('selected',active);b.setAttribute('aria-checked',String(active))}}
  moods.forEach((b,i)=>{b.addEventListener('click',()=>setMood(b.dataset.mood));b.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.key))return;e.preventDefault();const d=['ArrowDown','ArrowRight'].includes(e.key)?1:-1,next=moods[(i+d+moods.length)%moods.length];setMood(next.dataset.mood);next.focus()})});
  triggers.forEach(b=>b.addEventListener('click',()=>{trigger=trigger===b.dataset.trigger?'':b.dataset.trigger;for(const t of triggers){const active=t.dataset.trigger===trigger;t.classList.toggle('selected',active);t.setAttribute('aria-pressed',String(active))}}));
  nameInput.addEventListener('input',()=>{error.hidden=true;nameInput.removeAttribute('aria-invalid')});
  nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();scanButton.click()}});

  const scanMessages=['正在检索你的隐藏人格……','检测到大脑存在不明信号……','正在联系宇宙精神状态管理局……','警告：此人无法被正常分类……','档案盖章中，别紧张……'];
  function scan(){
    if(scanning)return;const name=cleanName(nameInput.value);
    if(!name){error.textContent='先留下一个名字或昵称，宇宙才知道查谁。';error.hidden=false;nameInput.setAttribute('aria-invalid','true');nameInput.focus();return}
    scanning=true;scanButton.disabled=true;nameInput.value=name;overlay.hidden=false;document.body.style.overflow='hidden';let start=performance.now(),last=-1;
    const duration=2750;
    function frame(now){const p=Math.min(1,(now-start)/duration),pct=Math.round((1-Math.pow(1-p,1.45))*100),step=Math.min(4,Math.floor(p*5));percentEl.textContent=pct+'%';progressEl.style.width=pct+'%';if(step!==last){statusEl.textContent=scanMessages[step];last=step}
      if(p<1)requestAnimationFrame(frame);else{setTimeout(()=>{overlay.hidden=true;document.body.style.overflow='';scanning=false;scanButton.disabled=false;current=makeResult(name,mood,trigger,reroll);showResult(current);resultArea.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})},260)}}
    requestAnimationFrame(frame)
  }
  function showResult(r){
    imageBlob=null;if(imageURL){URL.revokeObjectURL(imageURL);imageURL=''}
    resultArea.hidden=false;$('serial').textContent=`NO. ${r.code}`;$('rarity').textContent=r.rarity.name;$('display-name').textContent=`档案归属 / ${r.name}`;
    $('persona-title').textContent=r.title;$('identity').textContent=r.identity;$('index').textContent=r.index;$('ability').textContent=r.ability;$('weakness').textContent=r.weakness;$('verdict').textContent=r.verdict;
    $('dossier').style.setProperty('--rarity',r.rarity.color);$('meter-fill').style.width='0';requestAnimationFrame(()=>requestAnimationFrame(()=>$('meter-fill').style.width=r.index));
    // Rendering after the reveal keeps the share button responsive on slower phones.
    setTimeout(()=>prepareImage(r).catch(()=>{}),700);
  }
  scanButton.addEventListener('click',scan);
  $('reroll-button').addEventListener('click',()=>{reroll++;current=makeResult(cleanName(nameInput.value),mood,trigger,reroll);showResult(current);$('dossier').scrollIntoView({behavior:'smooth',block:'start'});toast('新档案已解封')});
  $('restart-button').addEventListener('click',()=>{resultArea.hidden=true;reroll=0;nameInput.value='';trigger='';triggers.forEach(t=>{t.classList.remove('selected');t.setAttribute('aria-pressed','false')});window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>nameInput.focus({preventScroll:true}),450)});

  function copyFallback(value){const ta=document.createElement('textarea');ta.value=value;ta.style.position='fixed';ta.style.left='-9999px';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}
  async function copy(value){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);return true}}catch(_){/* fallback */}try{return copyFallback(value)}catch(_){return false}}
  $('copy-button').addEventListener('click',async()=>{if(!current)return;const r=current;const content=`【赛博精神病院 · ${r.name}的人设档案】\n${r.rarity.name}｜${r.title}\n\n隐藏身份：${r.identity}\n精神状态指数：${r.index}\n特殊能力：${r.ability}\n致命弱点：${r.weakness}\n宇宙评价：${r.verdict}\n\n我的人格已经被系统封存，你也测测？\n${location.href.split('#')[0].split('?')[0]}`;toast(await copy(content)?'人设文案已复制':'复制失败，请长按结果卡片选择文字')});
  $('link-button').addEventListener('click',async()=>toast(await copy(location.href.split('#')[0].split('?')[0])?'邀请链接已复制':'复制失败，请从浏览器地址栏复制'));

  function roundedRect(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
  function wrap(ctx,text,maxWidth){const lines=[];let line='';for(const ch of Array.from(text)){if(ctx.measureText(line+ch).width>maxWidth&&line){lines.push(line);line=ch}else line+=ch}if(line)lines.push(line);return lines}
  function block(ctx,text,x,y,width,opt={}){const {size=34,min=26,maxLines=4,lineHeight=1.5,color='#e8f1ff',weight=400}=opt;let font=size,lines=[];while(font>=min){ctx.font=`${weight} ${font}px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif`;lines=wrap(ctx,text,width);if(lines.length<=maxLines)break;font-=2}ctx.fillStyle=color;for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],x,y+i*font*lineHeight);return y+lines.length*font*lineHeight}
  function renderImage(r){
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const c=canvas.getContext('2d');if(!c)throw new Error('Canvas unavailable');
    const w=1080,h=1920,accent=r.rarity.color;c.textBaseline='top';
    const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#101c36');bg.addColorStop(.52,'#0b1227');bg.addColorStop(1,'#17122d');c.fillStyle=bg;c.fillRect(0,0,w,h);
    const glow=c.createRadialGradient(790,140,20,790,140,600);glow.addColorStop(0,accent+'55');glow.addColorStop(1,'#00000000');c.fillStyle=glow;c.fillRect(0,0,w,h);
    c.strokeStyle='#6379a432';c.lineWidth=1;for(let x=80;x<1080;x+=70){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=0;y<h;y+=70){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
    c.fillStyle=accent;c.fillRect(0,0,w,10);c.strokeStyle=accent+'aa';c.lineWidth=2;c.strokeRect(44,44,w-88,h-88);
    c.font='bold 28px sans-serif';c.fillStyle=accent;c.fillText('∿',89,89);c.font='bold 25px sans-serif';c.fillStyle='#d9e7ff';c.fillText('宇宙精神状态管理局',143,94);
    c.textAlign='right';c.font='22px monospace';c.fillStyle='#91a7c8';c.fillText('NO. '+r.code,994,98);c.textAlign='left';c.fillStyle='#6685ac';c.fillRect(87,148,906,2);
    roundedRect(c,90,204,286,56,4,accent+'22');c.strokeStyle=accent;c.strokeRect(90,204,286,56);c.font='bold 25px sans-serif';c.fillStyle=accent;c.fillText(r.rarity.name,112,217);
    c.font='25px sans-serif';c.fillStyle='#9cb1d1';c.fillText('TOP SECRET / PERSONA FILE',90,291);
    block(c,`档案归属 / ${r.name}`,90,353,900,{size:34,min:28,maxLines:2,color:'#b9cbed'});
    const titleBottom=block(c,r.title,90,430,900,{size:79,min:56,maxLines:3,lineHeight:1.22,color:'#f6f8ff',weight:800});
    const identityY=Math.max(652,titleBottom+30);block(c,r.identity,90,identityY,900,{size:32,min:26,maxLines:5,lineHeight:1.48,color:'#d3def2'});
    const indexY=920;c.font='28px sans-serif';c.fillStyle='#adbfdb';c.fillText('精神状态指数',90,indexY);c.textAlign='right';c.font='bold 60px monospace';c.fillStyle=accent;c.fillText(r.index,988,indexY-25);c.textAlign='left';c.fillStyle='#263a5d';c.fillRect(90,1002,900,12);c.fillStyle=accent;c.fillRect(90,1002,900*Math.min(1,parseFloat(r.index)/100),12);
    c.strokeStyle='#4d638a';c.lineWidth=2;c.strokeRect(90,1060,900,220);c.strokeRect(90,1300,900,220);
    c.font='bold 27px sans-serif';c.fillStyle=accent;c.fillText('✦  特殊能力',122,1090);block(c,r.ability,122,1140,830,{size:37,min:29,maxLines:3,lineHeight:1.45,color:'#f4f7ff'});
    c.font='bold 27px sans-serif';c.fillStyle=accent;c.fillText('◇  致命弱点',122,1330);block(c,r.weakness,122,1380,830,{size:37,min:29,maxLines:3,lineHeight:1.45,color:'#f4f7ff'});
    roundedRect(c,90,1547,900,222,4,accent+'23');c.fillStyle=accent;c.fillRect(90,1547,6,222);c.font='24px monospace';c.fillStyle=accent;c.fillText('宇宙评价 // FINAL VERDICT',120,1576);block(c,r.verdict,120,1630,835,{size:34,min:27,maxLines:4,lineHeight:1.43,color:'#f7f1ff'});
    c.strokeStyle='#6680a277';c.beginPath();c.moveTo(90,1820);c.lineTo(990,1820);c.stroke();c.font='22px sans-serif';c.fillStyle='#a9bbd8';c.fillText('赛博精神病院 · 仅供快乐研究',90,1840);c.textAlign='right';c.font='21px monospace';c.fillStyle=accent;c.fillText('CYBER / ASYLUM',990,1840);c.textAlign='left';
    return canvas
  }
  async function prepareImage(r){
    if(!r||current!==r)return null;if(imageBlob)return imageBlob;
    const canvas=renderImage(r);const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('image export failed')),'image/png'));
    if(current!==r)return null;imageBlob=blob;imageURL=URL.createObjectURL(blob);return blob;
  }
  async function showImage(){try{const blob=await prepareImage(current);if(!blob)return;const img=$('export-preview');img.src=imageURL;imageModal.hidden=false;document.body.style.overflow='hidden';$('close-image').focus();toast('结果图片已生成')}catch(_){toast('图片生成失败，请重新试一次')}}
  $('image-button').addEventListener('click',showImage);
  function closeImage(){imageModal.hidden=true;document.body.style.overflow='';$('image-button').focus()}
  $('close-image').addEventListener('click',closeImage);imageModal.addEventListener('click',e=>{if(e.target===imageModal)closeImage()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!imageModal.hidden)closeImage()});
  function download(){if(!imageURL)return;const a=document.createElement('a');a.href=imageURL;a.download=`${current.name}-赛博人格档案.png`;document.body.append(a);a.click();a.remove();toast('已请求下载；若未保存，请长按上方图片')}
  $('download-button').addEventListener('click',download);
  async function shareImage(){try{const blob=await prepareImage(current);if(!blob)return;if(typeof File!=='undefined'&&navigator.share&&navigator.canShare){const file=new File([blob],`${current.name}-赛博人格档案.png`,{type:'image/png'});if(navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'赛博人格档案',text:'我的人格已经被系统封存，你也测测？'});return}}await showImage();toast('请长按图片保存后，从相册分享到微信')}catch(e){if(e?.name==='AbortError')return;await showImage();toast('请长按图片保存后，从相册分享到微信')}}
  $('share-button').addEventListener('click',shareImage);$('native-share-button').addEventListener('click',shareImage);
})();
