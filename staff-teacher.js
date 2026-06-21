// مجمع تحفيظ القرآن الكريم — منظومة الإدارة الرقمية
// يُحمَّل هذا الملف من staff.html

function pgTeacherSt(){
  var list=D.teacherStudents,حلقة=D.user['الحلقة']||'—';
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

function filterTbl(q2,tblId,attr){document.querySelectorAll('#'+tblId+' tbody tr').forEach(function(r){r.style.display=r.dataset[attr].includes(q2)?'':'none';});}

async function openNote(id,name,note){
  var res=await Swal.fire({title:'ملاحظة: '+name,html:'<textarea id="ni" class="swal2-textarea" style="font-family:Tajawal;direction:rtl;height:110px">'+(note||'')+'</textarea>',confirmButtonText:'حفظ',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){return document.getElementById('ni').value.trim();}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ الحفظ…');
  var r=await api('حفظ_ملاحظة_معلم',{رقم_الطالب:id,ملاحظة:res.value});
  spin(false);
  if(r.نجاح)Swal.fire({icon:'success',title:'تم',timer:1800,timerProgressBar:true,showConfirmButton:false});
}

function pgTeacherKpi(){
  var t=D.teacherKpi;
  mc('<div class="stitle"><i class="fas fa-chart-pie"></i> تقارير حلقتي</div><div class="kpi-grid">'
    +kpiCard('إجمالي الطلاب',t.إجمالي_طلاب_الحلقة||0,'fa-users','')
    +kpiCard('المنتظمون',t.منتظمون||0,'fa-user-check','kpi-ok')
    +kpiCard('مجموع الأجزاء',t.مجموع_حفظ_الحلقة||0,'fa-book-open','kpi-ac')
    +kpiCard('متوسط الحفظ/طالب',t.متوسط_الحفظ||0,'fa-chart-bar','')
    +'</div>');
}

// ══════════════════════════════════════════════════════
// Phase 3B — تحضير حضور الطالب اليومي
// ══════════════════════════════════════════════════════
function todayISO(){return new Date().toISOString().slice(0,10);}
function hesc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function attBadge(t){
  var cls={حاضر:'bp-ok',غائب:'bp-er','غائب_بعذر':'bp-wa','تأخر':'bp-in'}[t]||'bp-gr';
  var label={حاضر:'حاضر',غائب:'غائب','غائب_بعذر':'غائب بعذر','تأخر':'متأخر'}[t]||t||'—';
  return '<span class="bp '+cls+'">'+label+'</span>';
}

async function pgTeacherAttendance(){
  var حلقة=D.user['الحلقة']||'';
  var d=D.attDate||todayISO();
  mc('<div class="stitle"><i class="fas fa-calendar-check"></i> تحضير حضور الطالب اليومي</div>'
    +'<div class="cc"><div class="chdr"><h3>حلقة: '+hesc(حلقة||'—')+'</h3>'
    +'<div class="cacts">'
    +'<input class="fi" id="attDate" type="date" value="'+d+'" onchange="loadTeacherAttendanceDay()">'
    +'<button class="ob sm" onclick="setAllAttendance(\'حاضر\')"><i class="fas fa-check"></i> الكل حاضر</button>'
    +'<button class="ob sm" onclick="loadTeacherAttendanceDay()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'<button class="ob sm" onclick="saveTeacherAttendance()"><i class="fas fa-floppy-disk"></i> حفظ التحضير</button>'
    +'</div></div>'
    +'<div class="cbody" id="attSummary"><div class="empty"><div class="spri"></div><h3>جارٍ تحميل التحضير…</h3></div></div>'
    +'<div style="overflow-x:auto"><table class="dt" id="attTbl"><thead><tr><th>#</th><th>الطالب</th><th>الصف</th><th>الحفظ</th><th>الحالة</th><th>حضور اليوم</th><th>ملاحظة</th></tr></thead><tbody id="attBody"></tbody></table></div>'
    +'<div class="cbody"><div class="pgbar"><span id="attFoot">—</span><div class="pgbtns"><button class="pgbtn" onclick="showAttendanceReport()"><i class="fas fa-chart-column"></i> تقرير 30 يوم</button></div></div></div>'
    +'</div>');
  await loadTeacherAttendanceDay();
}

async function loadTeacherAttendanceDay(){
  var d=val('attDate')||todayISO();
  D.attDate=d;
  var حلقة=D.user['الحلقة']||'';
  spin(true,'جارٍ تحميل تحضير الحضور…');
  var r=await api('جلب_تحضير_حضور_يومي',{الحلقة:حلقة,التاريخ:d});
  spin(false);
  if(!r||!r.نجاح){
    document.getElementById('attSummary').innerHTML='<div class="empty"><i class="fas fa-triangle-exclamation"></i><h3>تعذر تحميل التحضير</h3><p>'+hesc((r&&r.خطأ)||'خطأ غير معروف')+'</p></div>';
    return;
  }
  D.attRows=arr(r.طلاب);
  D.attPerms=r.صلاحيات||{};
  renderAttendanceSummary(r.ملخص||{});
  document.getElementById('attBody').innerHTML=buildAttendanceRows(D.attRows);
  document.getElementById('attFoot').textContent='عدد الطلاب: '+D.attRows.length+' · التاريخ: '+d;
  updateAttendanceCounts();
}

function buildAttendanceRows(list){
  if(!list.length)return'<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--ts)">لا يوجد طلاب في هذه الحلقة</td></tr>';
  return list.map(function(s,i){
    var code=hesc(s['رقم_الطالب']||'');
    var typ=s['نوع_الحضور']||'حاضر';
    var note=hesc(s['ملاحظة']||'');
    var opts=['حاضر','تأخر','غائب','غائب_بعذر'].map(function(t){
      var lbl={حاضر:'حاضر',تأخر:'متأخر',غائب:'غائب','غائب_بعذر':'غائب بعذر'}[t];
      return '<option value="'+t+'" '+(typ===t?'selected':'')+'>'+lbl+'</option>';
    }).join('');
    return '<tr class="attRow" data-code="'+code+'" data-name="'+hesc(s['اسم_الطالب']||'')+'">'
      +'<td>'+(i+1)+'</td>'
      +'<td><strong>'+hesc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+code+'</div></td>'
      +'<td>'+(hesc(s['الصف_الدراسي']||s['المرحلة_الدراسية']||'—'))+'</td>'
      +'<td><strong style="color:var(--p)">'+(s['مجموع_الحفظ']||0)+'</strong> جزء</td>'
      +'<td>'+sBadge(s['حالة_الطالب'])+'</td>'
      +'<td><select class="fi attType" onchange="updateAttendanceCounts()" style="min-width:115px">'+opts+'</select></td>'
      +'<td><input class="fi attNote" value="'+note+'" placeholder="ملاحظة اختيارية" style="min-width:180px"></td>'
      +'</tr>';
  }).join('');
}

function readAttendanceItems(){
  var out=[];
  document.querySelectorAll('#attBody .attRow').forEach(function(r){
    out.push({
      رقم_الطالب:r.dataset.code||'',
      اسم_الطالب:r.dataset.name||'',
      نوع_الحضور:(r.querySelector('.attType')||{}).value||'حاضر',
      ملاحظة:(r.querySelector('.attNote')||{}).value||''
    });
  });
  return out;
}

function setAllAttendance(type){
  document.querySelectorAll('#attBody .attType').forEach(function(s){s.value=type||'حاضر';});
  updateAttendanceCounts();
}

function updateAttendanceCounts(){
  var c={حاضر:0,تأخر:0,غائب:0,'غائب_بعذر':0};
  readAttendanceItems().forEach(function(x){c[x.نوع_الحضور]=(c[x.نوع_الحضور]||0)+1;});
  var e=document.getElementById('attLiveCounts');
  if(e)e.innerHTML=attBadge('حاضر')+' '+c.حاضر+' &nbsp; '+attBadge('تأخر')+' '+c['تأخر']+' &nbsp; '+attBadge('غائب')+' '+c.غائب+' &nbsp; '+attBadge('غائب_بعذر')+' '+c['غائب_بعذر'];
}

function renderAttendanceSummary(m){
  document.getElementById('attSummary').innerHTML='<div class="kpi-grid" style="margin-bottom:0">'
    +kpiCard('إجمالي الطلاب',m['إجمالي']||0,'fa-users','')
    +kpiCard('المسجل اليوم',m['مسجل']||0,'fa-clipboard-check','kpi-ok')
    +kpiCard('لم يحفظ بعد',m['غير_مسجل']||0,'fa-hourglass-half','kpi-wa')
    +kpiCard('غياب',m['غائب']||0,'fa-calendar-xmark','kpi-er')
    +'</div><div id="attLiveCounts" style="font-size:12.5px;color:var(--ts);margin-top:10px"></div>';
}

async function saveTeacherAttendance(){
  var items=readAttendanceItems();
  if(!items.length){Swal.fire({icon:'info',title:'لا يوجد طلاب للحفظ',confirmButtonColor:'#1a3c5e'});return;}
  var d=val('attDate')||todayISO();
  var res=await Swal.fire({icon:'question',title:'حفظ تحضير الحضور؟',text:'سيتم حفظ حضور '+items.length+' طالب ليوم '+d,showCancelButton:true,confirmButtonText:'حفظ',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ حفظ تحضير الحضور…');
  var r=await api('حفظ_تحضير_حضور_يومي',{الحلقة:D.user['الحلقة']||'',التاريخ:d,طلاب:items});
  spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}
  Swal.fire({icon:'success',title:'تم الحفظ',text:'تم حفظ '+(r['تم_الحفظ']||0)+' سجل',timer:1800,timerProgressBar:true,showConfirmButton:false,customClass:{popup:'swal-rtl'}});
  await loadTeacherAttendanceDay();
}

async function showAttendanceReport(){
  var to=val('attDate')||todayISO();
  var from=new Date(to); from.setDate(from.getDate()-30);
  var fromISO=from.toISOString().slice(0,10);
  spin(true,'جارٍ تجهيز التقرير…');
  var r=await api('جلب_تقرير_حضور_حلقة',{الحلقة:D.user['الحلقة']||'',من:fromISO,إلى:to});
  spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر التقرير',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e'});return;}
  var rows=arr(r.طلاب).map(function(x){return'<tr><td>'+hesc(x['اسم_الطالب']||'')+'</td><td>'+x['حاضر']+'</td><td>'+x['تأخر']+'</td><td>'+x['غائب']+'</td><td>'+x['غائب_بعذر']+'</td><td>'+x['الإجمالي']+'</td></tr>';}).join('');
  Swal.fire({title:'تقرير حضور آخر 30 يوم',width:'820px',html:'<div style="direction:rtl;text-align:right;max-height:60vh;overflow:auto"><table class="dt"><thead><tr><th>الطالب</th><th>حاضر</th><th>متأخر</th><th>غائب</th><th>بعذر</th><th>الإجمالي</th></tr></thead><tbody>'+rows+'</tbody></table></div>',confirmButtonText:'إغلاق',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});
}

function pgTeacherPreparation(){
  return pgTeacherAttendance();
}
