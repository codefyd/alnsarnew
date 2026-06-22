// مجمع تحفيظ القرآن الكريم — منظومة الإدارة الرقمية
// يُحمَّل هذا الملف من staff.html

function pgTeacherSt(){
  var list=D.teacherStudents||[],حلقة=D.user['الحلقة']||'—';
  var rows=list.map(function(ط,i){
    return '<tr data-n="'+q(ط['اسم_الطالب']||'')+'">'
     +'<td>'+(i+1)+'</td><td><strong>'+q(ط['اسم_الطالب']||'—')+'</strong></td>'
     +'<td>'+(ط['المرحلة_الدراسية']||'—')+'</td><td>'+(ط['الصف_الدراسي']||'—')+'</td>'
     +'<td><strong style="color:var(--p)">'+(ط['مجموع_الحفظ']||0)+'</strong> جزء</td>'
     +'<td>'+sBadge(ط['حالة_الطالب'])+'</td>'
     +'<td><button class="ob sm" onclick="openNote(\''+q(ط['رقم_الطالب'])+'\',\''+q(ط['اسم_الطالب'])+'\',\''+q(ط['ملاحظات']||'')+'\')"><i class="fas fa-pen"></i> ملاحظة</button></td>'
     +'</tr>';
  }).join('');
  mc('<div class="stitle"><i class="fas fa-users"></i> طلاب حلقة: '+حلقة+'</div>'
    +'<div class="cc"><div class="chdr"><h3>القائمة ('+list.length+')</h3>'
    +'<div class="cacts"><input class="fi" style="min-width:180px" placeholder="بحث باسم…" oninput="filterTbl(this.value,\'tTbl\',\'n\')"></div></div>'
    +'<div style="overflow-x:auto"><table class="dt" id="tTbl">'
    +'<thead><tr><th>#</th><th>الاسم</th><th>المرحلة</th><th>الصف</th><th>الحفظ</th><th>الحالة</th><th>ملاحظة</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div></div>');
}

function filterTbl(q2,tblId,attr){document.querySelectorAll('#'+tblId+' tbody tr').forEach(function(r){r.style.display=(r.dataset[attr]||'').includes(q2)?'':'none';});}

async function openNote(id,name,note){
  var res=await Swal.fire({title:'ملاحظة: '+name,html:'<textarea id="ni" class="swal2-textarea" style="font-family:Tajawal;direction:rtl;height:110px">'+(note||'')+'</textarea>',confirmButtonText:'حفظ',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){return document.getElementById('ni').value.trim();}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ الحفظ…');
  var r=await api('حفظ_ملاحظة_معلم',{رقم_الطالب:id,ملاحظة:res.value});
  spin(false);
  if(r.نجاح)Swal.fire({icon:'success',title:'تم',timer:1800,timerProgressBar:true,showConfirmButton:false});
}

function pgTeacherKpi(){
  var t=D.teacherKpi||{};
  mc('<div class="stitle"><i class="fas fa-chart-pie"></i> تقارير حلقتي</div><div class="kpi-grid">'
    +kpiCard('إجمالي الطلاب',t.إجمالي_طلاب_الحلقة||0,'fa-users','')
    +kpiCard('المنتظمون',t.منتظمون||0,'fa-user-check','kpi-ok')
    +kpiCard('مجموع الأجزاء',t.مجموع_حفظ_الحلقة||0,'fa-book-open','kpi-ac')
    +kpiCard('متوسط الحفظ/طالب',t.متوسط_الحفظ||0,'fa-chart-bar','')
    +'</div>');
}

// ══════════════════════════════════════════════════════
// Phase 3D — التحضير اليومي الموحد + فصل التقارير والمسارات في القائمة
// ══════════════════════════════════════════════════════
function todayISO(){return new Date().toISOString().slice(0,10);}
function hesc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function attLabel(t){return {حاضر:'حاضر',غائب:'غائب','غائب_بعذر':'غائب بعذر',تأخر:'متأخر',متأخر:'متأخر'}[t]||t||'—';}
function attBadge(t){
  var cls={حاضر:'bp-ok',غائب:'bp-er','غائب_بعذر':'bp-wa',تأخر:'bp-in',متأخر:'bp-in'}[t]||'bp-gr';
  return '<span class="bp '+cls+'">'+attLabel(t)+'</span>';
}
function doneBadge(v){
  if(v===true || v==='true')return '<span class="bp bp-ok"><i class="fas fa-check"></i> أتم</span>';
  if(v===false || v==='false')return '<span class="bp bp-er"><i class="fas fa-xmark"></i> لم يتم</span>';
  return '<span class="bp bp-gr">اختياري</span>';
}
function pathOptions(sel){
  var paths=['','سفرة','ذهبي','فضي','سفرة 10 أسطر','تلاوة'];
  return paths.map(function(p){return '<option value="'+hesc(p)+'" '+(p===sel?'selected':'')+'>'+(p||'— اختر المسار —')+'</option>';}).join('');
}
function teacherCircle(){return (D.user&&D.user['الحلقة'])||'';}

async function pgTeacherAttendance(){return pgTeacherPreparation();}

async function pgTeacherPreparation(){
  var d=D.dailyPrepDate||todayISO();
  mc('<div class="stitle"><i class="fas fa-clipboard-check"></i> التحضير اليومي</div>'
    +'<div class="cc"><div class="chdr"><h3>تحضير حضور الطالب اليومي</h3>'
    +'<div class="cacts">'
    +'<input class="fi" id="dailyPrepDate" type="date" value="'+d+'" onchange="loadDailyPrep()">'
    +'<button class="ob sm" onclick="loadDailyPrep()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'<button class="ob sm" onclick="setAllAttendance(\'حاضر\')"><i class="fas fa-check"></i> الكل حاضر</button>'
    +'<button class="ob sm" onclick="saveDailyPrep()"><i class="fas fa-floppy-disk"></i> حفظ اليوم</button>'
    +'</div></div>'
    +'<div class="cbody" id="dailyTermBar"><div class="empty"><div class="spri"></div><h3>جارٍ تحميل الفترة…</h3></div></div>'
    +'<div class="cbody" id="dailySummary"></div>'
    +'<div style="overflow-x:auto"><table class="dt" id="dailyPrepTbl"><thead><tr><th>#</th><th>الطالب</th><th>المسار</th><th>الحضور</th><th>إتمام الحفظ</th><th>محفوظ اليوم</th><th>ملاحظة</th></tr></thead><tbody id="dailyPrepBody"></tbody></table></div>'
    +'<div class="cbody"><div class="pgbar"><span id="dailyPrepFoot">—</span><div class="pgbtns"><button class="pgbtn" onclick="saveDailyPrep()"><i class="fas fa-floppy-disk"></i> حفظ اليوم</button></div></div></div>'
    +'</div>');
  await loadDailyPrep();
}

async function loadDailyPrep(){
  var d=val('dailyPrepDate')||todayISO();
  D.dailyPrepDate=d;
  spin(true,'جارٍ تحميل التحضير اليومي…');
  var r=await api('جلب_تحضير_يومي_موحد',{الحلقة:teacherCircle(),التاريخ:d});
  spin(false);
  if(!r||!r.نجاح){
    var e=document.getElementById('dailyTermBar')||document.getElementById('weeklyReportBody')||document.getElementById('pathsBody');
    if(e)e.innerHTML='<div class="empty"><i class="fas fa-triangle-exclamation"></i><h3>تعذر تحميل البيانات</h3><p>'+hesc((r&&r.خطأ)||'خطأ غير معروف')+'</p></div>';
    return;
  }
  D.dailyRows=arr(r.طلاب);
  D.dailyPerms=r.صلاحيات||{};
  D.dailyTerm=r.الفترة||{};
  var title=document.querySelector('.stitle');
  if(title && r['الحلقة']) title.innerHTML=title.innerHTML+' <span style="font-size:12px;color:var(--ts);font-weight:500">· حلقة: '+hesc(r['الحلقة'])+'</span>';
  renderTermBar(r.الفترة||{});
  renderDailySummary(r.ملخص||{});
  document.getElementById('dailyPrepBody').innerHTML=buildDailyPrepRows(D.dailyRows);
  document.getElementById('dailyPrepFoot').textContent='عدد الطلاب: '+D.dailyRows.length+' · التاريخ: '+d;
  updateDailyCounts();
}

function renderTermBar(term){
  var e=document.getElementById('dailyTermBar'); if(!e)return;
  e.innerHTML='<div class="kpi-grid" style="margin-bottom:0">'
    +kpiCard('الفترة الحالية',hesc(term['اسم_الفترة']||'—'),'fa-calendar-days','')
    +kpiCard('نوع الفترة',hesc(term['نوع_الفترة']||'—'),'fa-layer-group','')
    +kpiCard('من',hesc(term['تاريخ_البداية']||'—'),'fa-play','kpi-ok')
    +kpiCard('إلى',hesc(term['تاريخ_النهاية']||'—'),'fa-flag-checkered','kpi-wa')
    +'</div>';
}

function renderDailySummary(m){
  var e=document.getElementById('dailySummary'); if(!e)return;
  e.innerHTML='<div class="kpi-grid" style="margin-bottom:0">'
    +kpiCard('إجمالي الطلاب',m['إجمالي']||0,'fa-users','')
    +kpiCard('مسجل اليوم',m['مسجل']||0,'fa-clipboard-check','kpi-ok')
    +kpiCard('لم يسجل',m['غير_مسجل']||0,'fa-hourglass-half','kpi-wa')
    +kpiCard('أتم الحفظ',m['أتم']||0,'fa-check','kpi-ok')
    +kpiCard('لم يتم',m['لم_يتم']||0,'fa-xmark','kpi-er')
    +'</div><div id="dailyLiveCounts" style="font-size:12.5px;color:var(--ts);margin-top:10px"></div>';
}

function attendanceButtons(cur){
  return ['حاضر','تأخر','غائب','غائب_بعذر'].map(function(t){
    var active=(cur||'حاضر')===t?' active':'';
    return '<button type="button" class="mini-att '+active+'" data-type="'+t+'" onclick="setRowAttendance(this)">'+attLabel(t)+'</button>';
  }).join('');
}
function doneButtons(v){
  var yes=(v===true||v==='true'), no=(v===false||v==='false');
  return '<button type="button" class="mini-done '+(yes?'active':'')+'" data-done="true" onclick="setRowDone(this)"><i class="fas fa-check"></i> أتم</button>'
    +'<button type="button" class="mini-done '+(no?'active':'')+'" data-done="false" onclick="setRowDone(this)"><i class="fas fa-xmark"></i> لم يتم</button>';
}

function buildDailyPrepRows(list){
  if(!list.length)return'<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--ts)">لا يوجد طلاب في هذه الحلقة، تأكد أن المستخدم مربوط بنفس اسم الحلقة في ملفه.</td></tr>';
  return list.map(function(s,i){
    var code=hesc(s['رقم_الطالب']||''), done=s['اتمام_الحفظ'];
    return '<tr class="dailyRow" data-code="'+code+'" data-name="'+hesc(s['اسم_الطالب']||'')+'" data-done="'+(done===true?'true':done===false?'false':'')+'">'
      +'<td>'+(i+1)+'</td>'
      +'<td><strong>'+hesc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+code+'</div></td>'
      +'<td><span class="bp bp-in">'+hesc(s['المسار']||'—')+'</span></td>'
      +'<td><div class="mini-wrap attWrap">'+attendanceButtons(s['نوع_الحضور']||'حاضر')+'</div></td>'
      +'<td><div class="mini-wrap doneWrap">'+doneButtons(done)+'</div></td>'
      +'<td><div style="display:flex;gap:6px;min-width:220px"><input class="fi surahInput" value="'+hesc(s['السورة']||'')+'" placeholder="السورة" style="min-width:120px"><input class="fi ayahInput" value="'+hesc(s['رقم_الاية']||'')+'" placeholder="رقم الآية" style="width:90px"></div></td>'
      +'<td><input class="fi dailyNote" value="'+hesc(s['ملاحظة']||'')+'" placeholder="اختياري" style="min-width:160px"></td>'
      +'</tr>';
  }).join('');
}

function setRowAttendance(btn){
  var wrap=btn.closest('.attWrap');
  wrap.querySelectorAll('.mini-att').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  updateDailyCounts();
}
function setRowDone(btn){
  var row=btn.closest('.dailyRow');
  var wrap=btn.closest('.doneWrap');
  var val=btn.dataset.done;
  if(row.dataset.done===val){
    row.dataset.done='';
    wrap.querySelectorAll('.mini-done').forEach(function(b){b.classList.remove('active');});
  }else{
    row.dataset.done=val;
    wrap.querySelectorAll('.mini-done').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
  }
  updateDailyCounts();
}
function setAllAttendance(type){
  document.querySelectorAll('#dailyPrepBody .dailyRow').forEach(function(r){
    r.querySelectorAll('.mini-att').forEach(function(b){b.classList.toggle('active',b.dataset.type===type);});
  });
  updateDailyCounts();
}
function getRowAttendance(row){var b=row.querySelector('.mini-att.active');return (b&&b.dataset.type)||'حاضر';}
function getRowDone(row){if(row.dataset.done==='true')return true;if(row.dataset.done==='false')return false;return null;}
function readDailyItems(){
  var out=[];
  document.querySelectorAll('#dailyPrepBody .dailyRow').forEach(function(r){
    out.push({
      رقم_الطالب:r.dataset.code||'',
      اسم_الطالب:r.dataset.name||'',
      نوع_الحضور:getRowAttendance(r),
      اتمام_الحفظ:getRowDone(r),
      السورة:(r.querySelector('.surahInput')||{}).value||'',
      رقم_الاية:(r.querySelector('.ayahInput')||{}).value||'',
      ملاحظة:(r.querySelector('.dailyNote')||{}).value||''
    });
  });
  return out;
}
function updateDailyCounts(){
  var c={حاضر:0,تأخر:0,غائب:0,'غائب_بعذر':0,done:0,notDone:0};
  document.querySelectorAll('#dailyPrepBody .dailyRow').forEach(function(r){
    c[getRowAttendance(r)] = (c[getRowAttendance(r)]||0)+1;
    if(getRowDone(r)===true)c.done++;
    if(getRowDone(r)===false)c.notDone++;
  });
  var e=document.getElementById('dailyLiveCounts');
  if(e)e.innerHTML=attBadge('حاضر')+' '+c.حاضر+' &nbsp; '+attBadge('تأخر')+' '+c['تأخر']+' &nbsp; '+attBadge('غائب')+' '+c.غائب+' &nbsp; '+attBadge('غائب_بعذر')+' '+c['غائب_بعذر']+' &nbsp; '+doneBadge(true)+' '+c.done+' &nbsp; '+doneBadge(false)+' '+c.notDone;
}

async function saveDailyPrep(){
  var items=readDailyItems();
  if(!items.length){Swal.fire({icon:'info',title:'لا يوجد طلاب للحفظ',confirmButtonColor:'#1a3c5e'});return;}
  var d=val('dailyPrepDate')||todayISO();
  var res=await Swal.fire({icon:'question',title:'حفظ تحضير اليوم؟',text:'سيتم حفظ حضور وتحضير '+items.length+' طالب ليوم '+d,showCancelButton:true,confirmButtonText:'حفظ',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ حفظ التحضير اليومي…');
  var r=await api('حفظ_تحضير_يومي_موحد',{الحلقة:teacherCircle(),التاريخ:d,طلاب:items});
  spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}
  Swal.fire({icon:'success',title:'تم الحفظ',text:'تم حفظ '+(r['تم_الحفظ']||0)+' سجل',timer:1800,timerProgressBar:true,showConfirmButton:false,customClass:{popup:'swal-rtl'}});
  await loadDailyPrep();
}

async function pgTeacherWeeklyReport(){
  var d=D.weeklyReportDate||todayISO();
  mc('<div class="stitle"><i class="fas fa-table"></i> تقرير الطلاب الأسبوعي</div>'
    +'<div class="cc"><div class="chdr"><h3>تقرير الحضور وإتمام الحفظ</h3><div class="cacts">'
    +'<input class="fi" id="weeklyReportDate" type="date" value="'+d+'">'
    +'<button class="ob sm" onclick="loadWeeklyPrepReport()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'</div></div><div class="cbody" id="weeklyReportBody"><div class="empty"><div class="spri"></div><h3>جارٍ تجهيز التقرير الأسبوعي…</h3></div></div></div>');
  await loadWeeklyPrepReport();
}

async function loadWeeklyPrepReport(){
  var d=val('weeklyReportDate')||D.weeklyReportDate||todayISO();
  D.weeklyReportDate=d;
  var to=new Date(d), from=new Date(d); from.setDate(to.getDate()-6);
  var fromISO=from.toISOString().slice(0,10), toISO=to.toISOString().slice(0,10);
  var body=document.getElementById('weeklyReportBody');
  if(body)body.innerHTML='<div class="empty"><div class="spri"></div><h3>جارٍ تجهيز التقرير الأسبوعي…</h3></div>';
  var r=await api('جلب_تقرير_تحضير_اسبوعي',{الحلقة:teacherCircle(),من:fromISO,إلى:toISO});
  if(!r||!r.نجاح){body.innerHTML='<div class="empty"><i class="fas fa-triangle-exclamation"></i><h3>تعذر تحميل التقرير</h3><p>'+hesc((r&&r.خطأ)||'خطأ غير معروف')+'</p></div>';return;}
  var days=arr(r['الأيام']);
  var head='<tr><th>الطالب</th>'+days.map(function(d){return '<th style="min-width:115px">'+new Date(d).toLocaleDateString('ar-SA',{weekday:'short',day:'numeric',month:'numeric'})+'</th>';}).join('')+'</tr>';
  var rows=arr(r.طلاب).map(function(s){
    var cells=days.map(function(d){
      var x=(s['الأيام']||{})[d]||{};
      var att=x['الحضور']||'';
      return '<td><div>'+ (att?attBadge(att):'<span class="bp bp-gr">—</span>') +'</div><div style="margin-top:5px">'+doneBadge(x['اتمام_الحفظ'])+'</div>'+(x['السورة']?'<div style="font-size:11px;color:var(--ts);margin-top:4px">'+hesc(x['السورة'])+' '+hesc(x['رقم_الاية']||'')+'</div>':'')+'</td>';
    }).join('');
    return '<tr><td><strong>'+hesc(s['اسم_الطالب']||'')+'</strong><div style="font-size:11px;color:var(--ts)">'+hesc(s['رقم_الطالب']||'')+'</div></td>'+cells+'</tr>';
  }).join('');
  body.innerHTML='<div class="pgbar" style="margin-bottom:10px"><span>حلقة: '+hesc(r['الحلقة']||teacherCircle()||'—')+' · من '+fromISO+' إلى '+toISO+'</span><div class="pgbtns"><button class="pgbtn" onclick="loadWeeklyPrepReport()"><i class="fas fa-rotate"></i> تحديث</button></div></div><div style="overflow:auto"><table class="dt"><thead>'+head+'</thead><tbody>'+(rows||'<tr><td colspan="'+(days.length+1)+'" style="text-align:center;padding:18px;color:var(--ts)">لا يوجد طلاب</td></tr>')+'</tbody></table></div>';
}

async function pgTeacherStudentPaths(){
  mc('<div class="stitle"><i class="fas fa-route"></i> مسارات الطلاب</div>'
    +'<div class="cc"><div class="chdr"><h3>تحديد مسار كل طالب</h3><div class="cacts">'
    +'<button class="ob sm" onclick="loadStudentPathsPage()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'<button class="ob sm" onclick="saveStudentPaths()"><i class="fas fa-floppy-disk"></i> حفظ المسارات</button>'
    +'</div></div>'
    +'<div class="cbody"><div class="pgbar"><span id="pathsInfo">جارٍ تحميل الطلاب…</span><div class="pgbtns"><button class="pgbtn" onclick="saveStudentPaths()"><i class="fas fa-floppy-disk"></i> حفظ المسارات</button></div></div></div>'
    +'<div style="overflow-x:auto"><table class="dt"><thead><tr><th>#</th><th>الطالب</th><th>الصف</th><th>المسار</th><th>ملاحظة</th></tr></thead><tbody id="pathsBody"><tr><td colspan="5" style="text-align:center;padding:18px"><div class="spri" style="margin:auto"></div></td></tr></tbody></table></div></div>');
  await loadStudentPathsPage();
}

async function loadStudentPathsPage(){
  var r=await api('جلب_تحضير_يومي_موحد',{الحلقة:teacherCircle(),التاريخ:todayISO()});
  if(!r||!r.نجاح){
    document.getElementById('pathsBody').innerHTML='<tr><td colspan="5" style="text-align:center;padding:18px;color:var(--er)">'+hesc((r&&r.خطأ)||'تعذر تحميل الطلاب')+'</td></tr>';
    return;
  }
  D.dailyRows=arr(r.طلاب);D.dailyTerm=r.الفترة||{};
  document.getElementById('pathsBody').innerHTML=buildPathRows(D.dailyRows);
  document.getElementById('pathsInfo').textContent='حلقة: '+(r['الحلقة']||teacherCircle()||'—')+' · عدد الطلاب: '+D.dailyRows.length+' · الفترة: '+((r.الفترة||{})['اسم_الفترة']||'—');
}

function buildPathRows(list){
  if(!list.length)return'<tr><td colspan="5" style="text-align:center;padding:18px;color:var(--ts)">لا يوجد طلاب في هذه الحلقة</td></tr>';
  return list.map(function(s,i){
    var code=hesc(s['رقم_الطالب']||'');
    return '<tr class="pathRow" data-code="'+code+'">'
      +'<td>'+(i+1)+'</td>'
      +'<td><strong>'+hesc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+code+'</div></td>'
      +'<td>'+hesc(s['الصف_الدراسي']||s['المرحلة_الدراسية']||'—')+'</td>'
      +'<td><select class="fi pathSelect" style="min-width:170px">'+pathOptions(s['المسار']||'')+'</select></td>'
      +'<td><input class="fi pathNote" placeholder="ملاحظة اختيارية" style="min-width:180px"></td>'
      +'</tr>';
  }).join('');
}

async function saveStudentPaths(){
  var items=[];
  document.querySelectorAll('#pathsBody .pathRow').forEach(function(r){
    var p=(r.querySelector('.pathSelect')||{}).value||'';
    if(p)items.push({رقم_الطالب:r.dataset.code||'',المسار:p,ملاحظة:(r.querySelector('.pathNote')||{}).value||''});
  });
  if(!items.length){Swal.fire({icon:'info',title:'لم تحدد أي مسار',confirmButtonColor:'#1a3c5e'});return;}
  spin(true,'جارٍ حفظ المسارات…');
  var r=await api('حفظ_مسارات_الطلاب',{الحلقة:teacherCircle(),term_id:D.dailyTerm&&D.dailyTerm.id,طلاب:items});
  spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر حفظ المسارات',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}
  Swal.fire({icon:'success',title:'تم حفظ المسارات',text:'تم حفظ '+(r['تم_الحفظ']||0)+' مسار',timer:1800,timerProgressBar:true,showConfirmButton:false,customClass:{popup:'swal-rtl'}});
  await loadStudentPathsPage();
}

(function(){
  if(document.getElementById('dailyPrepMiniCss'))return;
  var st=document.createElement('style');st.id='dailyPrepMiniCss';
  st.textContent='.mini-wrap{display:flex;gap:4px;flex-wrap:wrap;min-width:190px}.mini-att,.mini-done{border:1px solid var(--bd);background:#fff;color:var(--ts);border-radius:8px;padding:5px 8px;font-family:Tajawal;font-size:11.5px;font-weight:700;cursor:pointer}.mini-att.active,.mini-done.active{background:var(--p);border-color:var(--p);color:#fff}.mini-done.active[data-done="true"]{background:var(--ok);border-color:var(--ok)}.mini-done.active[data-done="false"]{background:var(--er);border-color:var(--er)}';
  document.head.appendChild(st);
})();

// ══════════════════════════════════════════════════════
// Phase 3F — تقرير الطلاب للفترة النشطة
// ══════════════════════════════════════════════════════
async function pgTeacherStudentPeriodReport(){
  var dTo=todayISO();
  mc('<div class="stitle"><i class="fas fa-chart-column"></i> تقرير الطلاب</div>'
    +'<div class="cc"><div class="chdr"><h3>ملخص الطلاب حسب الفترة النشطة</h3><div class="cacts">'
    +'<input class="fi" id="periodReportFrom" type="date" title="من">'
    +'<input class="fi" id="periodReportTo" type="date" value="'+dTo+'" title="إلى">'
    +'<button class="ob sm" onclick="loadStudentPeriodReport()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'<button class="ob sm" onclick="exportStudentPeriodReportCsv()"><i class="fas fa-file-csv"></i> CSV</button>'
    +'</div></div>'
    +'<div class="cbody" id="periodReportSummary"><div class="empty"><div class="spri"></div><h3>جارٍ تحميل التقرير…</h3></div></div>'
    +'<div style="overflow:auto"><table class="dt" id="periodReportTbl"><thead><tr>'
    +'<th>#</th><th>الطالب</th><th>المسار</th><th>أيام التحضير</th><th>حضور</th><th>تأخر</th><th>غياب</th><th>غياب بعذر</th><th>أتم</th><th>لم يتم</th><th>آخر محفوظ</th><th>النسب</th>'
    +'</tr></thead><tbody id="periodReportBody"><tr><td colspan="12" style="text-align:center;padding:18px"><div class="spri" style="margin:auto"></div></td></tr></tbody></table></div>'
    +'</div>');
  await loadStudentPeriodReport();
}

async function loadStudentPeriodReport(){
  var body=document.getElementById('periodReportBody');
  var sum=document.getElementById('periodReportSummary');
  if(body)body.innerHTML='<tr><td colspan="12" style="text-align:center;padding:18px"><div class="spri" style="margin:auto"></div></td></tr>';
  if(sum)sum.innerHTML='<div class="empty"><div class="spri"></div><h3>جارٍ تحميل التقرير…</h3></div>';
  var from=val('periodReportFrom'), to=val('periodReportTo')||todayISO();
  var data={الحلقة:teacherCircle(),إلى:to};
  if(from)data['من']=from;
  var r=await api('جلب_تقرير_طلاب_الفترة',data);
  if(!r||!r.نجاح){
    if(sum)sum.innerHTML='<div class="empty"><i class="fas fa-triangle-exclamation"></i><h3>تعذر تحميل التقرير</h3><p>'+hesc((r&&r.خطأ)||'خطأ غير معروف')+'</p></div>';
    if(body)body.innerHTML='<tr><td colspan="12" style="text-align:center;padding:18px;color:var(--er)">تعذر تحميل التقرير</td></tr>';
    return;
  }
  D.studentPeriodReport=r;
  renderStudentPeriodSummary(r);
  renderStudentPeriodRows(arr(r.طلاب));
}

function renderStudentPeriodSummary(r){
  var m=r.ملخص||{}, term=r.الفترة||{};
  var e=document.getElementById('periodReportSummary'); if(!e)return;
  e.innerHTML='<div class="pgbar" style="margin-bottom:12px"><span>الفترة: <strong>'+hesc(term['اسم_الفترة']||'—')+'</strong> · الحلقة: '+hesc(r['الحلقة']||teacherCircle()||'—')+' · من '+hesc(r['من']||'—')+' إلى '+hesc(r['إلى']||'—')+'</span></div>'
    +'<div class="kpi-grid" style="margin-bottom:0">'
    +kpiCard('عدد الطلاب',m['عدد_الطلاب']||0,'fa-users','')
    +kpiCard('أيام لها تحضير',m['أيام_لها_تحضير']||0,'fa-calendar-check','kpi-ok')
    +kpiCard('حضور',m['حضور']||0,'fa-user-check','kpi-ok')
    +kpiCard('تأخر',m['تأخر']||0,'fa-clock','kpi-wa')
    +kpiCard('غياب',m['غياب']||0,'fa-user-xmark','kpi-er')
    +kpiCard('أتم الحفظ',m['أتم_الحفظ']||0,'fa-check','kpi-ok')
    +'</div>';
}

function renderStudentPeriodRows(list){
  var body=document.getElementById('periodReportBody'); if(!body)return;
  if(!list.length){body.innerHTML='<tr><td colspan="12" style="text-align:center;padding:18px;color:var(--ts)">لا توجد بيانات طلاب</td></tr>';return;}
  body.innerHTML=list.map(function(s,i){
    var last=(s['آخر_سورة']||'') ? (hesc(s['آخر_سورة'])+' '+hesc(s['آخر_آية']||'')) : '—';
    var attPct=Number(s['نسبة_الحضور']||0), donePct=Number(s['نسبة_اتمام_الحفظ']||0);
    return '<tr>'
      +'<td>'+(i+1)+'</td>'
      +'<td><strong>'+hesc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+hesc(s['رقم_الطالب']||'')+' · '+hesc(s['الصف_الدراسي']||'')+'</div></td>'
      +'<td><span class="bp bp-in">'+hesc(s['المسار']||'—')+'</span></td>'
      +'<td><strong>'+hesc(s['أيام_التحضير']||0)+'</strong></td>'
      +'<td><span class="bp bp-ok">'+hesc(s['حضور']||0)+'</span></td>'
      +'<td><span class="bp bp-wa">'+hesc(s['تأخر']||0)+'</span></td>'
      +'<td><span class="bp bp-er">'+hesc(s['غياب']||0)+'</span></td>'
      +'<td><span class="bp bp-in">'+hesc(s['غياب_بعذر']||0)+'</span></td>'
      +'<td><span class="bp bp-ok">'+hesc(s['أتم_الحفظ']||0)+'</span></td>'
      +'<td><span class="bp bp-er">'+hesc(s['لم_يتم_الحفظ']||0)+'</span></td>'
      +'<td>'+last+'</td>'
      +'<td><div style="font-size:11px;color:var(--ts)">حضور: <strong>'+attPct+'%</strong></div><div style="font-size:11px;color:var(--ts)">إتمام: <strong>'+donePct+'%</strong></div></td>'
      +'</tr>';
  }).join('');
}

function exportStudentPeriodReportCsv(){
  var r=D.studentPeriodReport||{}, rows=arr(r.طلاب);
  if(!rows.length){Swal.fire({icon:'info',title:'لا توجد بيانات للتصدير',confirmButtonColor:'#1a3c5e'});return;}
  var cols=['رقم_الطالب','اسم_الطالب','الحلقة','المسار','أيام_التحضير','حضور','تأخر','غياب','غياب_بعذر','أتم_الحفظ','لم_يتم_الحفظ','آخر_سورة','آخر_آية','نسبة_الحضور','نسبة_اتمام_الحفظ'];
  var csv=cols.join(',')+'\n'+rows.map(function(x){return cols.map(function(c){return '"'+String(x[c]==null?'':x[c]).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='student_period_report_'+Date.now()+'.csv';a.click();
}

// =====================================================================
// Phase 4D — إدخال التقييمات التعليمية: الربط / الاختبارات / عرض الحزب
// =====================================================================
function scoreBadge(score, pass){
  if(score===null||score===undefined||score==='') return '<span class="bp bp-gr">—</span>';
  var cls = pass===false ? 'bp-er' : 'bp-ok';
  return '<span class="bp '+cls+'">'+hesc(score)+'/10</span>';
}
function currentWeekNo(){
  var d=new Date();
  var onejan=new Date(d.getFullYear(),0,1);
  return Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7);
}

function pgTeacherRabt(){
  var w=D.rabtWeek||currentWeekNo();
  var d=D.rabtDate||todayISO();
  mc('<div class="stitle"><i class="fas fa-link"></i> عرض الربط</div>'
    +'<div class="cc"><div class="chdr"><h3>إدخال درجات عرض الربط الأسبوعي</h3><div class="cacts">'
    +'<input id="rabtWeek" class="fi" type="number" min="1" max="60" value="'+w+'" style="width:105px" title="رقم الأسبوع">'
    +'<input id="rabtDate" class="fi" type="date" value="'+d+'">'
    +'<button class="ob sm" onclick="loadTeacherRabt()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'<button class="pb sm" onclick="saveTeacherRabt()"><i class="fas fa-floppy-disk"></i> حفظ الدرجات</button>'
    +'</div></div>'
    +'<div class="cbody" id="rabtInfo"><div class="empty"><div class="spri" style="margin:0 auto 10px"></div><p>جارٍ التحميل…</p></div></div>'
    +'<div style="overflow:auto"><table class="dt"><thead><tr><th>#</th><th>الطالب</th><th>الدرجة من 10</th><th>الحالة</th><th>ملاحظة</th></tr></thead><tbody id="rabtBody"></tbody></table></div>'
    +'</div>');
  loadTeacherRabt();
}
async function loadTeacherRabt(){
  D.rabtWeek=Number(val('rabtWeek')||currentWeekNo());D.rabtDate=val('rabtDate')||todayISO();
  var info=document.getElementById('rabtInfo'), body=document.getElementById('rabtBody');
  if(info)info.innerHTML='<div class="empty"><div class="spri" style="margin:0 auto 10px"></div><p>جارٍ تحميل الطلاب…</p></div>';
  var r=await api('جلب_عرض_الربط',{الحلقة:teacherCircle(),الأسبوع:D.rabtWeek,التاريخ:D.rabtDate});
  if(!r||!r.نجاح){if(info)info.innerHTML='<div class="empty"><h3>تعذر التحميل</h3><p>'+hesc((r&&r.خطأ)||'')+'</p></div>';return;}
  var set=r['الإعدادات']||{}, pass=Number(set['اقل_درجة_الربط']||7);
  var enabled=r['مفعل_للحلقة'];
  if(info)info.innerHTML='<div class="pgbar"><span>الفترة: <strong>'+hesc((r['الفترة']||{})['اسم_الفترة']||'—')+'</strong> · الأسبوع '+hesc(r['الأسبوع'])+' · أقل درجة للنجاح: <strong>'+pass+'</strong> · الحلقة: '+(enabled?'<span class="bp bp-ok">مفعلة للربط</span>':'<span class="bp bp-wa">غير مفعلة للربط</span>')+'</span></div>';
  var rows=arr(r['طلاب']).map(function(s,i){
    var score=s['الدرجة'];var passed=score===''||score==null?null:Number(score)>=pass;
    return '<tr class="rabtRow" data-code="'+hesc(s['رقم_الطالب']||'')+'"><td>'+(i+1)+'</td><td><strong>'+hesc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+hesc(s['رقم_الطالب']||'')+'</div></td>'
      +'<td><input class="fi rabtScore" type="number" min="0" max="10" step="0.25" value="'+hesc(score==null?'':score)+'" style="width:100px" oninput="updateRabtRowStatus(this,'+pass+')"></td>'
      +'<td class="rabtStatus">'+scoreBadge(score,passed)+'</td>'
      +'<td><input class="fi rabtNote" value="'+hesc(s['ملاحظات']||'')+'" placeholder="اختياري" style="min-width:150px"></td></tr>';
  }).join('');
  body.innerHTML=rows||'<tr><td colspan="5" style="text-align:center;padding:18px;color:var(--ts)">لا يوجد طلاب</td></tr>';
}
function updateRabtRowStatus(inp,pass){var tr=inp.closest('tr');var v=inp.value;if(!tr)return;tr.querySelector('.rabtStatus').innerHTML=scoreBadge(v,v===''?null:Number(v)>=pass);}
async function saveTeacherRabt(){
  var items=[];document.querySelectorAll('.rabtRow').forEach(function(tr){var score=tr.querySelector('.rabtScore').value;if(score==='')return;items.push({رقم_الطالب:tr.dataset.code,الدرجة:score,ملاحظات:tr.querySelector('.rabtNote').value});});
  spin(true,'جارٍ حفظ عرض الربط…');var r=await api('حفظ_عرض_الربط',{الحلقة:teacherCircle(),الأسبوع:Number(val('rabtWeek')||currentWeekNo()),التاريخ:val('rabtDate')||todayISO(),طلاب:items});spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e'});return;}
  Swal.fire({icon:'success',title:'تم حفظ الدرجات',text:'تم حفظ '+(r['تم_الحفظ']||0)+' سجل',timer:1700,showConfirmButton:false});loadTeacherRabt();
}

function pgTeacherTests(){
  var d=D.testDate||todayISO();
  mc('<div class="stitle"><i class="fas fa-clipboard-list"></i> اختبارات الطلاب</div>'
    +'<div class="cc"><div class="chdr"><h3>إدخال درجات الاختبارات</h3><div class="cacts">'
    +'<input id="testNo" class="fi" type="number" min="1" value="'+(D.testNo||1)+'" style="width:110px" title="رقم الاختبار">'
    +'<input id="testDate" class="fi" type="date" value="'+d+'">'
    +'<button class="ob sm" onclick="loadTeacherTests()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'<button class="pb sm" onclick="saveTeacherTests()"><i class="fas fa-floppy-disk"></i> حفظ الاختبار</button>'
    +'</div></div><div class="cbody" id="testInfo"></div><div style="overflow:auto"><table class="dt"><thead><tr><th>#</th><th>الطالب</th><th>الدرجة من 10</th><th>الحالة</th><th>ملاحظة</th></tr></thead><tbody id="testBody"></tbody></table></div></div>');
  loadTeacherTests();
}
async function loadTeacherTests(){
  D.testNo=Number(val('testNo')||1);D.testDate=val('testDate')||todayISO();
  var r=await api('جلب_اختبارات_الطلاب',{الحلقة:teacherCircle(),رقم_الاختبار:D.testNo,التاريخ:D.testDate});
  if(!r||!r.نجاح){document.getElementById('testInfo').innerHTML='<div class="empty"><h3>تعذر التحميل</h3><p>'+hesc((r&&r.خطأ)||'')+'</p></div>';return;}
  var set=r['الإعدادات']||{}, pass=Number(set['اقل_درجة_الاختبار']||7), count=set['عدد_الاختبارات']||3;
  document.getElementById('testInfo').innerHTML='<div class="pgbar"><span>الفترة: <strong>'+hesc((r['الفترة']||{})['اسم_الفترة']||'—')+'</strong> · الاختبار '+hesc(r['رقم_الاختبار'])+' من '+hesc(count)+' · أقل درجة للنجاح: <strong>'+pass+'</strong></span></div>';
  document.getElementById('testBody').innerHTML=arr(r['طلاب']).map(function(s,i){var score=s['الدرجة'];var passed=score===''||score==null?null:Number(score)>=pass;return '<tr class="testRow" data-code="'+hesc(s['رقم_الطالب']||'')+'"><td>'+(i+1)+'</td><td><strong>'+hesc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+hesc(s['رقم_الطالب']||'')+'</div></td><td><input class="fi testScore" type="number" min="0" max="10" step="0.25" value="'+hesc(score==null?'':score)+'" style="width:100px" oninput="updateTestRowStatus(this,'+pass+')"></td><td class="testStatus">'+scoreBadge(score,passed)+'</td><td><input class="fi testNote" value="'+hesc(s['ملاحظات']||'')+'" placeholder="اختياري" style="min-width:150px"></td></tr>';}).join('')||'<tr><td colspan="5" style="text-align:center;padding:18px;color:var(--ts)">لا يوجد طلاب</td></tr>';
}
function updateTestRowStatus(inp,pass){var tr=inp.closest('tr');var v=inp.value;if(!tr)return;tr.querySelector('.testStatus').innerHTML=scoreBadge(v,v===''?null:Number(v)>=pass);}
async function saveTeacherTests(){var items=[];document.querySelectorAll('.testRow').forEach(function(tr){var score=tr.querySelector('.testScore').value;if(score==='')return;items.push({رقم_الطالب:tr.dataset.code,الدرجة:score,ملاحظات:tr.querySelector('.testNote').value});});spin(true,'جارٍ حفظ الاختبار…');var r=await api('حفظ_اختبارات_الطلاب',{الحلقة:teacherCircle(),رقم_الاختبار:Number(val('testNo')||1),التاريخ:val('testDate')||todayISO(),طلاب:items});spin(false);if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e'});return;}Swal.fire({icon:'success',title:'تم حفظ الاختبار',text:'تم حفظ '+(r['تم_الحفظ']||0)+' سجل',timer:1700,showConfirmButton:false});loadTeacherTests();}

function pgTeacherHizb(){
  mc('<div class="stitle"><i class="fas fa-book-quran"></i> عرض الحزب</div>'
    +'<div class="cc"><div class="chdr"><h3>إضافة عرض حزب</h3><div class="cacts"><button class="pb sm" onclick="openHizbPresentationForm()"><i class="fas fa-plus"></i> إضافة عرض</button><button class="ob sm" onclick="loadTeacherHizb()"><i class="fas fa-rotate"></i> تحديث</button></div></div><div class="cbody" id="hizbInfo"></div><div style="overflow:auto"><table class="dt"><thead><tr><th>التاريخ</th><th>الطالب</th><th>رقم الحزب</th><th>الدرجة</th><th>ملاحظات</th><th>إجراء</th></tr></thead><tbody id="hizbBody"></tbody></table></div></div>');
  loadTeacherHizb();
}
async function loadTeacherHizb(){var r=await api('جلب_عرض_الحزب',{الحلقة:teacherCircle(),التاريخ:todayISO()});D.hizbData=r;if(!r||!r.نجاح){document.getElementById('hizbInfo').innerHTML='<div class="empty"><h3>تعذر التحميل</h3><p>'+hesc((r&&r.خطأ)||'')+'</p></div>';return;}document.getElementById('hizbInfo').innerHTML='<div class="pgbar"><span>الفترة: <strong>'+hesc((r['الفترة']||{})['اسم_الفترة']||'—')+'</strong> · عدد عروض الحزب: '+arr(r['عروض']).length+'</span></div>';document.getElementById('hizbBody').innerHTML=arr(r['عروض']).map(function(x){return '<tr><td>'+hesc(String(x['تاريخ_العرض']||'').slice(0,10))+'</td><td><strong>'+hesc(x['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+hesc(x['رقم_الطالب']||'')+'</div></td><td><span class="bp bp-in">'+hesc(x['رقم_الحزب']||'')+'</span></td><td>'+scoreBadge(x['الدرجة'],true)+'</td><td>'+hesc(x['ملاحظات']||'')+'</td><td><button class="erb sm" onclick="deleteHizbPresentation(\''+hesc(x['معرف'])+'\')"><i class="fas fa-trash"></i></button></td></tr>';}).join('')||'<tr><td colspan="6" style="text-align:center;padding:18px;color:var(--ts)">لا توجد عروض حزب</td></tr>';}
async function openHizbPresentationForm(){var students=arr((D.hizbData||{})['طلاب']);if(!students.length){await loadTeacherHizb();students=arr((D.hizbData||{})['طلاب']);}var opts=students.map(function(s){return '<option value="'+hesc(s['رقم_الطالب'])+'">'+hesc(s['اسم_الطالب'])+' — '+hesc(s['رقم_الطالب'])+'</option>';}).join('');var res=await Swal.fire({title:'إضافة عرض حزب',html:'<div style="direction:rtl;text-align:right;display:grid;gap:10px"><div><label style="font-size:12px;font-weight:700">الطالب</label><select id="hzStudent" class="swal2-select" style="font-family:Tajawal;width:100%;margin:4px 0 0">'+opts+'</select></div><div><label style="font-size:12px;font-weight:700">رقم الحزب</label><input id="hzNo" type="number" min="1" class="swal2-input" style="font-family:Tajawal;width:100%;margin:4px 0 0"></div><div><label style="font-size:12px;font-weight:700">الدرجة</label><input id="hzScore" type="number" min="0" max="10" step="0.25" class="swal2-input" style="font-family:Tajawal;width:100%;margin:4px 0 0"></div><div><label style="font-size:12px;font-weight:700">التاريخ</label><input id="hzDate" type="date" value="'+todayISO()+'" class="swal2-input" style="font-family:Tajawal;width:100%;margin:4px 0 0"></div><textarea id="hzNote" class="swal2-textarea" placeholder="ملاحظة اختيارية" style="font-family:Tajawal;direction:rtl;height:80px;width:100%;margin:0"></textarea></div>',showCancelButton:true,confirmButtonText:'حفظ',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){if(!val('hzStudent')||!val('hzNo'))return Swal.showValidationMessage('الطالب ورقم الحزب مطلوبان');return{رقم_الطالب:val('hzStudent'),رقم_الحزب:val('hzNo'),الدرجة:val('hzScore'),تاريخ_العرض:val('hzDate'),ملاحظات:val('hzNote')};}});if(!res.isConfirmed)return;spin(true,'جارٍ حفظ عرض الحزب…');var r=await api('حفظ_عرض_الحزب',res.value);spin(false);if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e'});return;}Swal.fire({icon:'success',title:'تم حفظ عرض الحزب',timer:1500,showConfirmButton:false});loadTeacherHizb();}
async function deleteHizbPresentation(id){var res=await Swal.fire({icon:'warning',title:'حذف عرض الحزب؟',showCancelButton:true,confirmButtonText:'حذف',cancelButtonText:'إلغاء',confirmButtonColor:'#c0392b',customClass:{popup:'swal-rtl'}});if(!res.isConfirmed)return;spin(true,'جارٍ الحذف…');var r=await api('حذف_عرض_الحزب',{معرف:id});spin(false);if(r&&r.نجاح){Swal.fire({icon:'success',title:'تم الحذف',timer:1200,showConfirmButton:false});loadTeacherHizb();}else Swal.fire({icon:'error',title:'تعذر الحذف',text:(r&&r.خطأ)||'خطأ غير معروف'});}
