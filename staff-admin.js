// مجمع تحفيظ القرآن الكريم — منظومة الإدارة الرقمية
// يُحمَّل هذا الملف من staff.html

function pgAdminKpi(){
  var t=D.kpi;
  mc('<div class="stitle"><i class="fas fa-chart-pie"></i> لوحة تقارير المشرف الإداري</div>'
    +'<div class="kpi-grid">'
    +kpiCard('إجمالي الطلاب',t.إجمالي_الطلاب||0,'fa-users','')
    +kpiCard('المنتظمون',t.طلاب_منتظمون||0,'fa-user-check','kpi-ok')
    +kpiCard('الموقوفون',t.طلاب_موقوفون||0,'fa-user-slash','kpi-er')
    +kpiCard('طلبات جديدة',t.طلبات_جديدة||0,'fa-inbox','kpi-wa')
    +kpiCard('قائمة الانتظار',t.طلبات_انتظار||0,'fa-hourglass-half','')
    +'</div>'
    +'<div class="stitle mt-2"><i class="fas fa-user-clock"></i> إنذارات التأخر</div><div class="kpi-grid">'
    +kpiCard('مستحقة',t.إنذارات_اداري_تأخر_مستحقة||0,'fa-clock','kpi-er')
    +kpiCard('مكتملة',t.ارشيف_تأخر||0,'fa-check','kpi-ok')
    +'</div><div class="stitle mt-2"><i class="fas fa-calendar-xmark"></i> إنذارات الغياب</div><div class="kpi-grid">'
    +kpiCard('مستحقة',t.إنذارات_اداري_غياب_مستحقة||0,'fa-calendar-xmark','kpi-er')
    +kpiCard('مكتملة',t.ارشيف_غياب||0,'fa-check','kpi-ok')
    +'</div><div class="stitle mt-2"><i class="fas fa-calendar-minus"></i> إنذارات الغياب بعذر</div><div class="kpi-grid">'
    +kpiCard('مستحقة',t.إنذارات_اداري_عذر_مستحقة||0,'fa-calendar-minus','kpi-wa')
    +kpiCard('مكتملة',t.ارشيف_عذر||0,'fa-check','kpi-ok')
    +'</div><div class="stitle mt-2"><i class="fas fa-book-open"></i> الإنذارات التعليمية</div><div class="kpi-grid">'
    +kpiCard('مفتوحة',t.انذ_تعليمية_مفتوحة||0,'fa-triangle-exclamation','kpi-er')
    +'</div>');
}

function pgAdminSt(){
  D.studentsPage=1; D.selStudents=new Set();
  var copts=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  var sopts=D.statuses.map(function(h){return'<option>'+h+'</option>';}).join('');
  mc('<div class="stitle"><i class="fas fa-users"></i> إدارة الطلاب</div>'
    +'<div class="cc"><div class="chdr"><h3>الطلاب ('+D.studentsTotal+')</h3>'
    +'<div class="cacts">'
    +'<button class="ob sm" onclick="exportCSV()"><i class="fas fa-file-csv"></i> CSV</button>'
    +'<button class="ob sm" onclick="bulkEdit()"><i class="fas fa-pen-to-square"></i> جماعي</button>'
    +'</div></div>'
    +'<div class="cbody" style="padding:12px 16px 0"><div class="fb">'
    +'<input class="fi" id="fN" placeholder="بحث بالاسم أو الهوية…" oninput="reloadSt()" style="flex:1;min-width:160px">'
    +'<select class="fi" id="fC" onchange="reloadSt()"><option value="">كل الحلق</option>'+copts+'</select>'
    +'<select class="fi" id="fS" onchange="reloadSt()"><option value="">كل الحالات</option>'+sopts+'</select>'
    +'<input class="fi" id="fHn" type="number" min="0" max="30" placeholder="حفظ >" oninput="reloadSt()" style="width:90px">'
    +'<input class="fi" id="fHx" type="number" min="0" max="30" placeholder="حفظ <" oninput="reloadSt()" style="width:90px">'
    +'</div></div>'
    +'<div style="overflow-x:auto"><table class="dt"><thead><tr>'
    +'<th><input type="checkbox" id="selAll" onchange="toggleSelAll(this)"></th>'
    +'<th>الاسم</th><th>الهوية</th><th>الحلقة</th><th>الحفظ</th><th>الحالة</th><th>إجراء</th>'
    +'</tr></thead><tbody id="stBody">'+buildStRows(D.students)+'</tbody></table></div>'
    +'<div class="cbody"><div class="pgbar">'
    +'<span id="pgI">الصفحة 1 من '+D.studentsPages+' · إجمالي '+D.studentsTotal+'</span>'
    +'<div class="pgbtns" id="pgB">'+buildPgBtns(1,D.studentsPages)+'</div>'
    +'</div></div></div>');
}

function buildStRows(list){
  if(!list.length)return'<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--ts)">لا توجد نتائج</td></tr>';
  return list.map(function(ط){
    return'<tr><td><input type="checkbox" class="sc" value="'+q(ط['رقم_الطالب']||'')+'" onchange="toggleSel(this)"></td>'
     +'<td><a href="#" onclick="openStDetail(\''+qj(ط)+'\');return false" style="color:var(--pl);font-weight:700;text-decoration:none">'+q(ط['اسم_الطالب']||'—')+'</a></td>'
     +'<td style="font-size:11.5px;color:var(--ts)">'+q(ط['رقم_الهوية']||'—')+'</td>'
     +'<td>'+(ط['الحلقة']||'—')+'</td>'
     +'<td><strong>'+(ط['مجموع_الحفظ']||0)+'</strong> جزء</td>'
     +'<td>'+sBadge(ط['حالة_الطالب'])+'</td>'
     +'<td><button class="ob sm" onclick="openStDetail(\''+qj(ط)+'\')"><i class="fas fa-eye"></i></button></td>'
     +'</tr>';
  }).join('');
}

async function reloadSt(){
  var data={بحث:val('fN'),الحلقة:val('fC'),حالة_الطالب:val('fS'),حجم_الصفحة:PG,الصفحة:D.studentsPage};
  var mn=val('fHn'),mx=val('fHx');
  if(mn)data.حفظ_اكثر_من=mn; if(mx)data.حفظ_اقل_من=mx;
  spin(true);var r=await api('جلب_الطلاب',data);spin(false);
  D.students=arr(r.طلاب);
  document.getElementById('stBody').innerHTML=buildStRows(D.students);
  document.getElementById('pgI').textContent='الصفحة '+D.studentsPage+' من '+r.عدد_الصفحات+' · إجمالي '+r.المجموع;
  document.getElementById('pgB').innerHTML=buildPgBtns(D.studentsPage,r.عدد_الصفحات||1);
}

function buildPgBtns(cur,total){
  var h='';
  function b(p){h+='<button class="pgbtn '+(p===cur?'active':'')+'" onclick="goPg('+p+')">'+p+'</button>';}
  if(total<=6){for(var i=1;i<=total;i++)b(i);}
  else{b(1);if(cur>3)h+='<span class="pgbtn" style="cursor:default">…</span>';for(var j=Math.max(2,cur-1);j<=Math.min(total-1,cur+1);j++)b(j);if(cur<total-2)h+='<span class="pgbtn" style="cursor:default">…</span>';b(total);}
  return h;
}

async function goPg(p){D.studentsPage=p;await reloadSt();}

function toggleSelAll(cb){document.querySelectorAll('.sc').forEach(function(c){c.checked=cb.checked;toggleSel(c);});}

function toggleSel(cb){if(cb.checked)D.selStudents.add(cb.value);else D.selStudents.delete(cb.value);}

async function exportCSV(){spin(true,'جارٍ التصدير…');var r=await api('تصدير_الطلاب_csv',{});spin(false);if(r.csv){var b=new Blob(['\uFEFF'+r.csv],{type:'text/csv;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='students_'+Date.now()+'.csv';a.click();}}

async function bulkEdit(){
  var ids=Array.from(D.selStudents);
  if(!ids.length){Swal.fire({icon:'info',title:'لم تختر طلاباً',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}
  var co=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  var so=D.statuses.map(function(h){return'<option>'+h+'</option>';}).join('');
  var res=await Swal.fire({title:'تعديل جماعي ('+ids.length+')',html:'<div style="direction:rtl;display:grid;gap:10px;text-align:right"><div><label style="font-size:12px;font-weight:600">الحلقة</label><select id="bC" class="swal2-select" style="font-family:Tajawal"><option value="">-- لا تغيير --</option>'+co+'</select></div><div><label style="font-size:12px;font-weight:600">الحالة</label><select id="bS" class="swal2-select" style="font-family:Tajawal"><option value="">-- لا تغيير --</option>'+so+'</select></div><div><label style="font-size:12px;font-weight:600">مجموع الحفظ</label><input id="bH" type="number" min="0" max="30" class="swal2-input" style="font-family:Tajawal"></div></div>',confirmButtonText:'تطبيق',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){var t={},c=val('bC'),s=val('bS'),h=val('bH');if(c)t['الحلقة']=c;if(s)t['حالة_الطالب']=s;if(h)t['مجموع_الحفظ']=h;if(!Object.keys(t).length)return Swal.showValidationMessage('عدّل حقلاً واحداً على الأقل');return t;}});
  if(!res.isConfirmed||!res.value)return;
  spin(true,'جارٍ التعديل…');var r=await api('تعديل_جماعي_طلاب',{أرقام_الطلاب:ids,تعديلات:res.value});spin(false);
  if(r.نجاح){Swal.fire({icon:'success',title:r.رسالة,timer:2000,timerProgressBar:true,showConfirmButton:false});reloadSt();}
}

async function openStDetail(sdStr){
  var ط=JSON.parse(decodeURIComponent(sdStr));
  var co=D.circles.map(function(h){return'<option value="'+h+'" '+(h===ط['الحلقة']?'selected':'')+'>'+h+'</option>';}).join('');
  var so=D.statuses.map(function(h){return'<option value="'+h+'" '+(h===ط['حالة_الطالب']?'selected':'')+'>'+h+'</option>';}).join('');
  var go=(GRADES[ط['المرحلة_الدراسية']]||[]).map(function(g){return'<option '+(g===ط['الصف_الدراسي']?'selected':'')+'>'+g+'</option>';}).join('');
  var res=await Swal.fire({title:'تعديل: '+q(ط['اسم_الطالب']),width:'640px',html:'<div style="direction:rtl;display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:right">'+sField('الاسم الكامل','sd_name',ط['اسم_الطالب'],'text',true)+sField('رقم الهوية','sd_id',ط['رقم_الهوية'],'text',true)+sField('رقم الجوال','sd_phone',ط['رقم_الجوال'],'text',false)+sField('الحي/العنوان','sd_addr',ط['الحي_العنوان'],'text',false)+'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الحلقة</label><select id="sd_circle" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="">—</option>'+co+'</select></div><div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الحالة</label><select id="sd_status" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="">—</option>'+so+'</select></div><div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">المرحلة</label><select id="sd_stage" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0">'+['ابتدائي','متوسط','ثانوي','جامعي'].map(function(s){return'<option '+(s===ط['المرحلة_الدراسية']?'selected':'')+'>'+s+'</option>';}).join('')+'</select></div><div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الصف</label><select id="sd_grade" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="">—</option>'+go+'</select></div>'+sField('مجموع الحفظ','sd_hifz',ط['مجموع_الحفظ']||0,'number',false)+sField('جوال ولي الأمر','sd_pph',ط['رقم_جوال_ولي_الامر']||'','text',false)+'</div>',confirmButtonText:'حفظ',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){return{رقم_الجوال:val('sd_phone'),الحي_العنوان:val('sd_addr'),الحلقة:val('sd_circle'),حالة_الطالب:val('sd_status'),المرحلة_الدراسية:val('sd_stage'),الصف_الدراسي:val('sd_grade'),مجموع_الحفظ:val('sd_hifz'),_p:val('sd_pph')};}});
  if(!res.isConfirmed||!res.value)return;
  var edits={},pph=res.value._p;
  Object.keys(res.value).forEach(function(k){if(k!=='_p'&&res.value[k]!=='')edits[k]=res.value[k];});
  spin(true,'جارٍ الحفظ…');var r=await api('تعديل_بيانات_طالب',{رقم_الطالب:ط['رقم_الطالب'],تعديلات:edits,تعديلات_ولي_الامر:pph?{رقم_جوال_ولي_الامر:pph}:{}});spin(false);
  if(r.نجاح){Swal.fire({icon:'success',title:'تم الحفظ',timer:2000,timerProgressBar:true,showConfirmButton:false});reloadSt();}
}

function pgAdminReq(){
  updateReqBadge();
  mc('<div class="stitle"><i class="fas fa-inbox"></i> الطلبات الواردة</div>'
    +'<div class="cc"><div class="stabs" id="rqTabs">'
    +'<button class="stab '+(_curTab==='rqNew'?'active':'')+'" onclick="swRqTab(this,\'rqNew\')"><i class="fas fa-clock"></i> جديد ('+arr(D.reqNew).length+')</button>'
    +'<button class="stab '+(_curTab==='rqWait'?'active':'')+'" onclick="swRqTab(this,\'rqWait\')"><i class="fas fa-hourglass-half"></i> انتظار ('+arr(D.reqWait).length+')</button>'
    +'<button class="stab '+(_curTab==='rqRej'?'active':'')+'" onclick="swRqTab(this,\'rqRej\')"><i class="fas fa-circle-xmark"></i> المرفوضون</button>'
    +'<button class="stab '+(_curTab==='rqEdit'?'active':'')+'" onclick="swRqTab(this,\'rqEdit\')"><i class="fas fa-pen"></i> التعديلات ('+arr(D.reqEdits).length+')</button>'
    +'</div>'
    +'<div class="spanel '+(_curTab==='rqNew'?'active':'')+'" id="rqNew">'+buildReqTbl(arr(D.reqNew),'new')+'</div>'
    +'<div class="spanel '+(_curTab==='rqWait'?'active':'')+'" id="rqWait">'+buildReqTbl(arr(D.reqWait),'wait')+'</div>'
    +'<div class="spanel '+(_curTab==='rqRej'?'active':'')+'" id="rqRej">'
    +(D.reqRejLoaded?'<div style="overflow-x:auto">'+buildRejTbl(arr(D.reqRej))+'</div>':'<div class="cbody"><div class="empty"><i class="fas fa-hourglass"></i><h3>اضغط لتحميل المرفوضين</h3><button class="ob sm" style="margin-top:8px" onclick="loadRej()"><i class="fas fa-download"></i> تحميل</button></div></div>')
    +'</div>'
    +'<div class="spanel '+(_curTab==='rqEdit'?'active':'')+'" id="rqEdit">'+buildEditTbl(arr(D.reqEdits))+'</div>'
    +'</div>');
  if(_curTab==='rqRej'&&!D.reqRejLoaded)loadRej();
}

function swRqTab(btn,id){
  _curTab=id;
  document.querySelectorAll('#rqTabs .stab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('#rqTabs ~ .spanel').forEach(function(p){p.classList.remove('active');});
  btn.classList.add('active');
  var e=document.getElementById(id);if(e)e.classList.add('active');
  if(id==='rqRej'&&!D.reqRejLoaded)loadRej();
}

function buildReqTbl(list,mode){
  if(!list.length)return'<div class="cbody"><div class="empty"><i class="fas fa-inbox"></i><h3>لا توجد طلبات</h3></div></div>';
  var rows=list.map(function(ط){
    var waS='<a href="#" onclick="whatsapp(\''+q(ط['رقم_جوال_الطالب'])+'\');return false" style="color:var(--ok)"><i class="fab fa-whatsapp me-1"></i>'+(ط['رقم_جوال_الطالب']||'—')+'</a>';
    var waP='<a href="#" onclick="whatsapp(\''+q(ط['رقم_جوال_ولي_الامر'])+'\');return false" style="color:var(--ok)"><i class="fab fa-whatsapp me-1"></i>'+(ط['رقم_جوال_ولي_الامر']||'—')+'</a>';
    var btns='';
    if(mode==='new')btns='<button class="okb sm" onclick="acceptReq(\''+q(ط['رقم_الطلب'])+'\',\''+q(ط['اسم_الطالب']||'')+'\')"><i class="fas fa-check"></i></button> <button class="warnb sm" onclick="waitReq(\''+q(ط['رقم_الطلب'])+'\')"><i class="fas fa-hourglass-half"></i></button> ';
    else btns='<button class="okb sm" onclick="acceptReq(\''+q(ط['رقم_الطلب'])+'\',\''+q(ط['اسم_الطالب']||'')+'\')"><i class="fas fa-check"></i></button> ';
    btns+='<button class="erb sm" onclick="rejectReq(\''+q(ط['رقم_الطلب'])+'\')"><i class="fas fa-times"></i></button>';
    return'<tr id="rr_'+q(ط['رقم_الطلب'])+'"><td><strong>'+q(ط['اسم_الطالب']||'—')+'</strong></td><td>'+waS+'</td><td>'+waP+'</td><td>'+(ط['المرحلة_الدراسية']||'—')+'</td><td>'+(ط['الصف_الدراسي']||'—')+'</td><td style="font-size:11px">'+fmtDate(ط['تاريخ_الطلب'])+'</td><td style="white-space:nowrap">'+btns+'</td></tr>';
  }).join('');
  return'<div style="overflow-x:auto"><table class="dt"><thead><tr><th>الاسم</th><th>الجوال</th><th>جوال و.الأمر</th><th>المرحلة</th><th>الصف</th><th>التاريخ</th><th>إجراء</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function buildRejTbl(list){
  if(!list.length)return'<div class="empty"><i class="fas fa-check-circle" style="color:var(--ok)"></i><h3>لا توجد مرفوضة</h3></div>';
  var rows=list.map(function(ط){return'<tr><td><strong>'+q(ط['اسم_الطالب']||'—')+'</strong></td><td><a href="#" onclick="whatsapp(\''+q(ط['رقم_جوال_الطالب'])+'\');return false" style="color:var(--ok)"><i class="fab fa-whatsapp me-1"></i>'+(ط['رقم_جوال_الطالب']||'—')+'</a></td><td>'+(ط['المرحلة_الدراسية']||'—')+'</td><td style="color:var(--er)">'+q(ط['سبب_الرفض']||'—')+'</td><td style="font-size:11px">'+fmtDate(ط['تاريخ_المعالجة'])+'</td></tr>';}).join('');
  return'<table class="dt"><thead><tr><th>الاسم</th><th>الجوال</th><th>المرحلة</th><th>سبب الرفض</th><th>التاريخ</th></tr></thead><tbody>'+rows+'</tbody></table>';
}

function buildEditTbl(list){
  if(!list.length)return'<div class="cbody"><div class="empty"><i class="fas fa-check-circle" style="color:var(--ok)"></i><h3>لا توجد طلبات تعديل</h3></div></div>';
  var rows=list.map(function(ط){return'<tr id="er_'+q(ط['رقم_الطلب'])+'"><td><strong>'+q(ط['اسم_الطالب']||'—')+'</strong></td><td>'+(ط['الحقل_المراد_تعديله']||'—')+'</td><td style="color:var(--er)">'+q(ط['القيمة_القديمة']||'—')+'</td><td style="color:var(--ok);font-weight:700">'+q(ط['القيمة_الجديدة']||'—')+'</td><td><button class="okb sm" id="ea_'+q(ط['رقم_الطلب'])+'" onclick="approveEdit(\''+q(ط['رقم_الطلب'])+'\')"><i class="fas fa-check"></i></button> <button class="erb sm" id="er2_'+q(ط['رقم_الطلب'])+'" onclick="rejectEdit(\''+q(ط['رقم_الطلب'])+'\')"><i class="fas fa-times"></i></button></td></tr>';}).join('');
  return'<div style="overflow-x:auto"><table class="dt"><thead><tr><th>الطالب</th><th>الحقل</th><th>القديم</th><th>الجديد</th><th>إجراء</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

async function loadRej(){var e=document.getElementById('rqRej');if(e)e.innerHTML='<div class="cbody"><div class="empty"><div class="spri" style="margin:0 auto 8px"></div><p>جارٍ التحميل…</p></div></div>';var r=await api('جلب_طلبات_التسجيل',{حالة:'مرفوض'});D.reqRej=arr(r.طلبات);D.reqRejLoaded=true;if(e)e.innerHTML='<div style="overflow-x:auto">'+buildRejTbl(D.reqRej)+'</div>';}

async function acceptReq(id,name){
  var co=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  var res=await Swal.fire({title:'قبول: '+name,html:'<p style="font-size:12.5px;color:#5a6a7a;margin-bottom:10px">حدّد الحلقة</p><select id="ac" class="swal2-select" style="font-family:Tajawal"><option value="">-- اختر --</option>'+co+'</select>',confirmButtonText:'تأكيد',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1e7e4a',customClass:{popup:'swal-rtl'},preConfirm:function(){var v2=val('ac');if(!v2)return Swal.showValidationMessage('اختر الحلقة');return v2;}});
  if(!res.isConfirmed||!res.value)return;
  D.reqNew=arr(D.reqNew).filter(function(t){return t['رقم_الطلب']!==id;});
  D.reqWait=arr(D.reqWait).filter(function(t){return t['رقم_الطلب']!==id;});
  updateReqBadge();pgAdminReq();
  var r=await api('قبول_طلب_تسجيل',{رقم_الطلب:id,الحلقة:res.value});
  if(r.نجاح)Swal.fire({icon:'success',title:'تم القبول!',text:'رقم الطالب: '+r.رقم_الطالب,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});
  else Swal.fire({icon:'error',title:'خطأ',text:r.خطأ,confirmButtonColor:'#1a3c5e'});
}

async function waitReq(id){
  var item=arr(D.reqNew).find(function(t){return t['رقم_الطلب']===id;});
  D.reqNew=arr(D.reqNew).filter(function(t){return t['رقم_الطلب']!==id;});
  if(item){item=Object.assign({},item,{'حالة_الطلب':'انتظار'});D.reqWait=[item].concat(arr(D.reqWait));}
  updateReqBadge();pgAdminReq();
  api('تحويل_للانتظار',{رقم_الطلب:id});
  Swal.fire({icon:'info',title:'تم التحويل للانتظار',timer:1500,timerProgressBar:true,showConfirmButton:false});
}

async function rejectReq(id){
  var res=await Swal.fire({title:'سبب الرفض',input:'textarea',inputPlaceholder:'اكتب سبب الرفض…',inputAttributes:{style:'font-family:Tajawal;direction:rtl'},confirmButtonText:'تأكيد الرفض',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#c0392b',customClass:{popup:'swal-rtl'},preConfirm:function(v2){if(!v2||!v2.trim())return Swal.showValidationMessage('يجب إدخال السبب');return v2.trim();}});
  if(!res.isConfirmed||!res.value)return;
  D.reqNew=arr(D.reqNew).filter(function(t){return t['رقم_الطلب']!==id;});
  D.reqWait=arr(D.reqWait).filter(function(t){return t['رقم_الطلب']!==id;});
  updateReqBadge();pgAdminReq();
  api('رفض_طلب_تسجيل',{رقم_الطلب:id,سبب_الرفض:res.value});
  Swal.fire({icon:'success',title:'تم الرفض',timer:1800,timerProgressBar:true,showConfirmButton:false});
}

async function approveEdit(id){
  var ab=document.getElementById('ea_'+id),rb=document.getElementById('er2_'+id);
  if(ab)ab.disabled=true;if(rb)rb.disabled=true;
  spin(true);var r=await api('قبول_طلب_تعديل',{رقم_الطلب:id});spin(false);
  if(r.نجاح){var row=document.getElementById('er_'+id);if(row)row.remove();D.reqEdits=arr(D.reqEdits).filter(function(t){return t['رقم_الطلب']!==id;});updateReqBadge();Swal.fire({icon:'success',title:'تم القبول',timer:1500,timerProgressBar:true,showConfirmButton:false});}
  else{if(ab)ab.disabled=false;if(rb)rb.disabled=false;}
}

async function rejectEdit(id){
  var ab=document.getElementById('ea_'+id),rb=document.getElementById('er2_'+id);
  if(ab)ab.disabled=true;if(rb)rb.disabled=true;
  spin(true);var r=await api('رفض_طلب_تعديل',{رقم_الطلب:id});spin(false);
  if(r.نجاح){var row=document.getElementById('er_'+id);if(row)row.remove();D.reqEdits=arr(D.reqEdits).filter(function(t){return t['رقم_الطلب']!==id;});updateReqBadge();Swal.fire({icon:'info',title:'تم الرفض',timer:1500,timerProgressBar:true,showConfirmButton:false});}
  else{if(ab)ab.disabled=false;if(rb)rb.disabled=false;}
}

function pgAdminEduW(){
  var all=arr(D.adminEduW);
  var open=all.filter(function(a){return!String(a['تاريخ_الإغلاق']||'');});
  var procs=arr(D.procedures).filter(function(p){return p['نوع_الاجراء']==='تعليمي'&&p['نشط']!=='لا';});
  var copts=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  D._aewOpen=open;D._aewProcs=procs;
  mc('<div class="stitle"><i class="fas fa-book-open"></i> الإنذارات التعليمية</div>'
    +'<div class="cc"><div class="stabs">'
    +'<button class="stab active" onclick="swST(this,\'aewO\')">متابعة الإجراءات ('+open.length+')</button>'
    +'<button class="stab" onclick="swST(this,\'aewAll\')">جميع الإنذارات ('+all.length+')</button>'
    +'</div>'
    +'<div class="spanel active" id="aewO">'
    +'<div style="padding:12px 18px 0"><div class="fb">'
    +'<select class="fi" onchange="filterAEW(this.value,\'\')"><option value="">كل الحلق</option>'+copts+'</select>'
    +'<input class="fi" placeholder="بحث باسم…" oninput="filterAEW(\'\',this.value)" style="min-width:140px">'
    +'</div></div>'
    +'<div class="cbody" id="aewOBody">'+buildAEWCards(open,procs)+'</div></div>'
    +'<div class="spanel" id="aewAll"><div style="overflow-x:auto;padding:8px 16px">'+buildAEWAllTbl(all)+'</div></div>'
    +'</div>');
}

function buildAEWCards(list,procs){
  if(!list.length)return'<div class="empty"><i class="fas fa-check-circle" style="color:var(--ok)"></i><h3>لا توجد إنذارات مفتوحة</h3></div>';
  return list.map(function(a){
    var opts=procs.map(function(p){return'<option>'+p['اسم_الاجراء']+'</option>';}).join('');
    // جلب أرقام الجوال من الإنذار أو من قاموس الطلاب
    var stMap=D.eduStudentMap&&D.eduStudentMap[a['اسم_الطالب']]||{};
    var sPhone=a['رقم_جوال_الطالب']||stMap['رقم_الجوال']||stMap['رقم_جوال_الطالب']||'';
    var pPhone=a['رقم_جوال_ولي_الامر']||stMap['رقم_جوال_ولي_الامر']||'';
    var btnS=sPhone?'<button class="wab sm" onclick="admEduWa(\''+q(sPhone)+'\',\''+q(a['اسم_الطالب'])+'\',\''+q(a['سبب_الانذار']||'')+'\',true)"><i class="fab fa-whatsapp"></i> طالب</button>':'';
    var btnP=pPhone?'<button class="wab sm" onclick="admEduWa(\''+q(pPhone)+'\',\''+q(a['اسم_الطالب'])+'\',\''+q(a['سبب_الانذار']||'')+'\',false)"><i class="fab fa-whatsapp"></i> ولي الأمر</button>':'';
    return'<div class="wcard" id="awc_'+q(a['رقم_الانذار'])+'"><div class="wico wi-e"><i class="fas fa-triangle-exclamation"></i></div>'
     +'<div class="wbody"><h4>'+q(a['اسم_الطالب']||'—')+' · <span style="font-weight:400;font-size:11px">'+q(a['الحلقة']||'—')+'</span></h4>'
     +'<p>'+q(a['سبب_الانذار']||'—')+' · '+fmtDate(a['تاريخ_الإصدار'])+'<br>الإجراء: <strong>'+q(a['حالة_الإجراء']||'بانتظار')+'</strong></p>'
     +'</div><div class="wacts">'
     +'<select class="fi sm" id="ap_'+q(a['رقم_الانذار'])+'" style="font-size:11.5px"><option value="">تحديث</option>'+opts+'<option value="__done__">✓ اكتمل</option></select>'
     +'<button class="pb sm" onclick="saveEduWProc(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-save"></i> حفظ</button>'
     +'<button class="ob sm" onclick="editEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-pen"></i> تعديل</button>'
     +'<button class="ob sm" onclick="deleteEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-trash"></i> حذف</button>'
     +btnS+btnP
     +'</div></div>';
  }).join('');
}

function buildAEWAllTbl(list){
  if(!list.length)return'<div class="empty"><i class="fas fa-check-circle" style="color:var(--ok)"></i><h3>لا توجد إنذارات</h3></div>';
  var rows=list.map(function(a){
    var waS=a['رقم_جوال_الطالب']?'<a href="#" onclick="whatsapp(\''+q(a['رقم_جوال_الطالب'])+'\');return false" style="color:var(--ok)"><i class="fab fa-whatsapp me-1"></i>'+q(a['رقم_جوال_الطالب'])+'</a>':'—';
    var waP=a['رقم_جوال_ولي_الامر']?'<a href="#" onclick="whatsapp(\''+q(a['رقم_جوال_ولي_الامر'])+'\');return false" style="color:var(--ok)"><i class="fab fa-whatsapp me-1"></i>'+q(a['رقم_جوال_ولي_الامر'])+'</a>':'—';
    var closed=String(a['تاريخ_الإغلاق']||'');
    var badge=closed?'<span class="bp bp-ok">مكتمل</span>':'<span class="bp bp-er">مفتوح</span>';
    var acts='<button class="ob sm" onclick="editEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-pen"></i></button>'
      +(closed?'<button class="ob sm" onclick="reopenEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-rotate-left"></i></button>':'')
      +'<button class="ob sm" onclick="deleteEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-trash"></i></button>';
    return'<tr id="aewr_'+q(a['رقم_الانذار'])+'"><td><strong>'+q(a['اسم_الطالب']||'—')+'</strong></td><td>'+q(a['الحلقة']||'—')+'</td><td>'+waS+'</td><td>'+waP+'</td><td>'+q(a['سبب_الانذار']||'—')+'</td><td>'+q(a['حالة_الإجراء']||'—')+'</td><td>'+badge+'</td><td><div class="cacts">'+acts+'</div></td></tr>';
  }).join('');
  return'<table class="dt"><thead><tr><th>الطالب</th><th>الحلقة</th><th>جوال الطالب</th><th>جوال و.الأمر</th><th>السبب</th><th>الإجراء</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>'+rows+'</tbody></table>';
}

function filterAEW(c,q2){
  var l=arr(D._aewOpen);
  if(c)l=l.filter(function(a){return a['الحلقة']===c;});
  if(q2)l=l.filter(function(a){return String(a['اسم_الطالب']||'').includes(q2);});
  var e=document.getElementById('aewOBody');if(e)e.innerHTML=buildAEWCards(l,arr(D._aewProcs));
}

async function saveEduWProc(id){
  var sel=document.getElementById('ap_'+id);var v2=sel?sel.value:'';if(!v2)return;
  var done=v2==='__done__';
  if(done){var el=document.getElementById('awc_'+id);if(el)el.remove();}
  spin(true);var r=await api('تحديث_إجراء_انذار_تعليمي',{رقم_الانذار:id,الإجراء:done?'مكتمل':v2,مكتمل:done});spin(false);
  if(r.نجاح){
    D.adminEduW=arr(D.adminEduW).map(function(x){return String(x['رقم_الانذار'])===String(id)?Object.assign({},x,{'حالة_الإجراء':done?'مكتمل':v2,'تاريخ_الإغلاق':done?new Date().toISOString():(x['تاريخ_الإغلاق']||'')}):x;});
    if(!done&&sel)sel.value='';
    // Fix #6: تحديث جميع الإنذارات فوراً
    if(D.allWarnMap){Object.values(D.allWarnMap).forEach(function(s){s.edu=(s.edu||[]).map(function(x){return String(x['رقم_الانذار'])===String(id)?Object.assign({},x,{'حالة_الإجراء':done?'مكتمل':v2}):x;});});var wb=document.getElementById('awBody');if(wb)wb.innerHTML=buildAllWRows(Object.values(D.allWarnMap));}
    Swal.fire({icon:'success',title:'تم',timer:1200,showConfirmButton:false});
  }
}

function admEduWa(phone,sName,reason,isStudent){
  var tpl=(D.templates||[]).find(function(t){return isStudent?t['نوع_القالب']==='انذار_تعليمي_للطالب':t['نوع_القالب']==='انذار_تعليمي_لولي_الامر';});
  var msg=buildMsg(tpl?tpl['نص_القالب']:'',{اسم_الطالب:sName,السبب:reason,تاريخ:hijri()});
  whatsapp(phone,msg);
}


function getEduWarningById(id){
  var all=arr(D.adminEduW).concat(arr(D.eduWarnings));
  return all.find(function(x){return String(x['رقم_الانذار'])===String(id);})||{};
}
function eduReasonOptions(selected){
  var reasons=[];
  arr(D.eduReasons).forEach(function(x){reasons.push(typeof x==='string'?x:x['اسم_الاجراء']);});
  arr(D.procedures).forEach(function(p){if(p['نوع_الاجراء']==='سبب_تعليمي'&&p['نشط']!=='لا')reasons.push(p['اسم_الاجراء']);});
  reasons=Array.from(new Set(reasons.filter(Boolean)));
  return '<option value="">-- اختر --</option>'+reasons.map(function(r){return'<option '+(r===selected?'selected':'')+'>'+q(r)+'</option>';}).join('');
}
function eduActionOptions(selected){
  var acts=[];
  arr(D.eduProcs).forEach(function(x){acts.push(typeof x==='string'?x:x['اسم_الاجراء']);});
  arr(D.procedures).forEach(function(p){if(p['نوع_الاجراء']==='تعليمي'&&p['نشط']!=='لا')acts.push(p['اسم_الاجراء']);});
  acts=Array.from(new Set(acts.filter(Boolean)));
  return '<option value="">-- بدون تغيير --</option>'+acts.map(function(r){return'<option '+(r===selected?'selected':'')+'>'+q(r)+'</option>';}).join('');
}
async function editEduWarning(id){
  var a=getEduWarningById(id);
  var res=await Swal.fire({
    title:'تعديل الإنذار التعليمي',
    width:'620px',
    html:'<div style="direction:rtl;text-align:right;display:grid;gap:10px">'
      +'<div style="font-size:13px;color:var(--ts)">الطالب: <strong>'+q(a['اسم_الطالب']||'—')+'</strong> · رقم الإنذار: <strong>'+q(id)+'</strong></div>'
      +'<div><label style="font-size:12px;font-weight:700">سبب الإنذار</label><select id="edw_reason" class="swal2-select" style="font-family:Tajawal;width:100%;margin:4px 0 0">'+eduReasonOptions(a['سبب_الانذار'])+'</select></div>'
      +'<div><label style="font-size:12px;font-weight:700">الإجراء</label><select id="edw_action" class="swal2-select" style="font-family:Tajawal;width:100%;margin:4px 0 0">'+eduActionOptions(a['حالة_الإجراء'])+'</select></div>'
      +'<div><label style="font-size:12px;font-weight:700">اسم المشرف</label><input id="edw_sup" class="swal2-input" style="font-family:Tajawal;width:100%;margin:4px 0 0" value="'+q(a['اسم_المشرف']||'')+'"></div>'
      +'<div><label style="font-size:12px;font-weight:700">تاريخ الإصدار</label><input id="edw_date" type="date" class="swal2-input" style="font-family:Tajawal;width:100%;margin:4px 0 0" value="'+String(a['تاريخ_الإصدار']||'').slice(0,10)+'"></div>'
      +'<div><label style="font-size:12px;font-weight:700">ملاحظات</label><textarea id="edw_notes" class="swal2-textarea" style="font-family:Tajawal;direction:rtl;height:90px;width:100%;margin:4px 0 0">'+q(a['ملاحظات']||'')+'</textarea></div>'
      +'</div>',
    showCancelButton:true,
    confirmButtonText:'حفظ التعديل',
    cancelButtonText:'إلغاء',
    confirmButtonColor:'#1a3c5e',
    customClass:{popup:'swal-rtl'},
    preConfirm:function(){
      var reason=val('edw_reason');
      if(!reason)return Swal.showValidationMessage('اختر سبب الإنذار');
      return {سبب_الانذار:reason,حالة_الإجراء:val('edw_action'),اسم_المشرف:val('edw_sup'),تاريخ_الإصدار:val('edw_date'),ملاحظات:val('edw_notes')};
    }
  });
  if(!res.isConfirmed)return;
  spin(true,'جارٍ تعديل الإنذار…');
  var r=await api('تعديل_انذار_تعليمي',Object.assign({رقم_الانذار:id},res.value));
  spin(false);
  if(r.نجاح){
    ['adminEduW','eduWarnings'].forEach(function(k){D[k]=arr(D[k]).map(function(x){return String(x['رقم_الانذار'])===String(id)?Object.assign({},x,res.value):x;});});
    Swal.fire({icon:'success',title:'تم التعديل',timer:1400,showConfirmButton:false});
    if(typeof pgAdminEduW==='function' && arr(D.adminEduW).length) pgAdminEduW();
  }else Swal.fire({icon:'error',title:'خطأ',text:r.خطأ||'تعذر تعديل الإنذار',confirmButtonColor:'#1a3c5e'});
}
async function deleteEduWarning(id){
  var res=await Swal.fire({icon:'warning',title:'حذف الإنذار؟',text:'سيتم حذف الإنذار نهائيًا من السجل.',showCancelButton:true,confirmButtonText:'حذف',cancelButtonText:'إلغاء',confirmButtonColor:'#c0392b',customClass:{popup:'swal-rtl'}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ الحذف…');var r=await api('حذف_انذار_تعليمي',{رقم_الانذار:id});spin(false);
  if(r.نجاح){
    D.adminEduW=arr(D.adminEduW).filter(function(x){return String(x['رقم_الانذار'])!==String(id);});
    D.eduWarnings=arr(D.eduWarnings).filter(function(x){return String(x['رقم_الانذار'])!==String(id);});
    var el=document.getElementById('awc_'+id);if(el)el.remove();
    var row=document.getElementById('aewr_'+id);if(row)row.remove();
    updateEduBadge();
    Swal.fire({icon:'success',title:'تم الحذف',timer:1300,showConfirmButton:false});
  }else Swal.fire({icon:'error',title:'خطأ',text:r.خطأ||'تعذر الحذف',confirmButtonColor:'#1a3c5e'});
}
async function reopenEduWarning(id){
  var res=await Swal.fire({icon:'question',title:'التراجع عن إغلاق الإنذار؟',text:'سيعود الإنذار إلى قائمة المتابعة المفتوحة.',showCancelButton:true,confirmButtonText:'تراجع عن الإغلاق',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ إعادة فتح الإنذار…');var r=await api('إعادة_فتح_انذار_تعليمي',{رقم_الانذار:id});spin(false);
  if(r.نجاح){
    ['adminEduW','eduWarnings'].forEach(function(k){D[k]=arr(D[k]).map(function(x){return String(x['رقم_الانذار'])===String(id)?Object.assign({},x,{'تاريخ_الإغلاق':'','حالة_الإجراء':'بانتظار الإدارة'}):x;});});
    updateEduBadge();
    Swal.fire({icon:'success',title:'تمت إعادة فتح الإنذار',timer:1400,showConfirmButton:false});
    if(typeof pgAdminEduW==='function' && arr(D.adminEduW).length) pgAdminEduW();
  }else Swal.fire({icon:'error',title:'خطأ',text:r.خطأ||'تعذر إعادة الفتح',confirmButtonColor:'#1a3c5e'});
}

async function pgAdminAdmW(){
  var wd=D.admWarnData||null;
  var cntT=wd?arr((wd['تأخر']||{}).list).length:0;
  var cntG=wd?arr((wd['غياب']||{}).list).length:0;
  var cntE=wd?arr((wd['غياب_بعذر']||{}).list).length:0;
  mc('<div class="stitle"><i class="fas fa-user-clock"></i> الإنذارات الإدارية</div>'
    +'<div class="cc"><div class="chdr"><h3>متابعة إنذارات الغياب والتأخر</h3><div class="cacts"><button class="ob sm" onclick="refreshAdmWarnings()"><i class="fas fa-rotate"></i> تحديث الحساب</button></div></div><div class="stabs" id="admWTabs">'
    +'<button class="stab active" onclick="loadAdmWT(\'تأخر\',this)"><i class="fas fa-clock"></i> التأخر'+(cntT?'<span class="nbadge" style="margin-right:5px">'+cntT+'</span>':'')+'</button>'
    +'<button class="stab" onclick="loadAdmWT(\'غياب\',this)"><i class="fas fa-calendar-xmark"></i> الغياب'+(cntG?'<span class="nbadge" style="margin-right:5px">'+cntG+'</span>':'')+'</button>'
    +'<button class="stab" onclick="loadAdmWT(\'غياب_بعذر\',this)"><i class="fas fa-calendar-minus"></i> الغياب بعذر'+(cntE?'<span class="nbadge" style="margin-right:5px">'+cntE+'</span>':'')+'</button>'
    +'</div><div id="admWC" class="cbody"><div class="empty"><div class="spri" style="margin:0 auto 8px"></div></div></div></div>');
  loadAdmWT('تأخر',document.querySelector('#admWTabs .stab'));
}

async function loadAdmWT(نوع,tabEl){
  document.querySelectorAll('#admWTabs .stab').forEach(function(t){t.classList.remove('active');});
  if(tabEl)tabEl.classList.add('active');
  D.admType=نوع;
  // استخدام البيانات المجلوبة مسبقاً — لا انتظار!
  var cached=D.admWarnData&&D.admWarnData[نوع];
  var مستحقون, أرشيف;
  if(cached){
    // بيانات جاهزة من الخلفية — لا انتظار
    مستحقون=arr(cached.list); أرشيف=arr(cached.arch);
  } else {
    // لم تُجلب بعد — نجلبها الآن
    spin(true,'جارٍ الحساب…');
    try{
      var rs=await Promise.all([
        api('جلب_مستحقي_الانذار_الاداري',{نوع:نوع}),
        api('جلب_ارشيف_انذارات_ادارية',{نوع_الانذار:نوع}),
      ]);
      مستحقون=arr(rs[0].طلاب); أرشيف=arr(rs[1].انذارات);
      if(!D.admWarnData)D.admWarnData={};
      D.admWarnData[نوع]={list:مستحقون,arch:أرشيف};
    }catch(e){ console.warn('loadAdmWT:',e); مستحقون=[]; أرشيف=[]; }
    spin(false);
  }
  var procs=arr(D.procedures).filter(function(p){return p['نوع_الاجراء']===نوع&&p['نشط']!=='لا';});
  D.admTpl=(D.templates||[]).find(function(t){return t['نوع_القالب']&&(t['نوع_القالب'].includes(نوع==='تأخر'?'تاخر':نوع==='غياب_بعذر'?'بعذر':'غياب'));});
  D.admProcs=procs;D._admNew=مستحقون;D._admArch=أرشيف;
  var copts=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  var archRows=أرشيف.map(function(a){return'<tr><td><strong>'+q(a['اسم_الطالب']||'—')+'</strong></td><td>'+(a['الحلقة']||'—')+'</td><td>'+(a['نوع_الانذار']||'—')+'</td><td>'+(a['رقم_العتبة']||'—')+'</td><td>'+(a['عدد_المخالفات']||'—')+'</td><td>'+(a['حالة_الإجراء']||'—')+'</td><td style="font-size:11px">'+fmtDate(a['تاريخ_الإغلاق'])+'</td></tr>';}).join('');
  document.getElementById('admWC').innerHTML=
    '<div class="stabs" style="border-bottom:1px solid var(--bd);margin:-18px -20px 14px;padding:0 8px">'
    +'<button class="stab active" onclick="swST(this,\'adwN\')">الجديدة ('+مستحقون.length+')</button>'
    +'<button class="stab" onclick="swST(this,\'adwA\')">السابقة ('+أرشيف.length+')</button>'
    +'</div>'
    +'<div class="spanel active" id="adwN">'
    +'<div class="fb"><select class="fi" onchange="filterAdmW(this.value,\'\')"><option value="">كل الحلق</option>'+copts+'</select>'
    +'<input class="fi" placeholder="بحث باسم…" oninput="filterAdmW(\'\',this.value)" style="min-width:140px"></div>'
    +'<div id="admWCards">'+buildAdmWCards(مستحقون)+'</div></div>'
    +'<div class="spanel" id="adwA">'
    +(أرشيف.length?'<div style="overflow-x:auto"><table class="dt"><thead><tr><th>الطالب</th><th>الحلقة</th><th>النوع</th><th>العتبة</th><th>المخالفات</th><th>الإجراء</th><th>التاريخ</th></tr></thead><tbody>'+archRows+'</tbody></table></div>':'<div class="empty"><i class="fas fa-box-archive"></i><h3>لا يوجد أرشيف</h3></div>')
    +'</div>';
}

function buildAdmWCards(list){
  if(!list.length)return'<div class="empty"><i class="fas fa-check-circle" style="color:var(--ok)"></i><h3>لا يوجد طلاب مستحقون</h3></div>';
  var procs=arr(D.admProcs);
  return list.map(function(ط){
    var opts=procs.map(function(p){return'<option>'+p['اسم_الاجراء']+'</option>';}).join('');
    var btnWa=ط['رقم_جوال_ولي_الامر']?'<button class="wab sm" onclick="sendAdmWa(\''+q(ط['رقم_جوال_ولي_الامر'])+'\',\''+q(ط['اسم_الطالب'])+'\',\''+q(ط['اسم_ولي_الامر']||'')+'\','+ط['رقم_العتبة']+','+ط['عدد_المخالفات']+')"><i class="fab fa-whatsapp"></i> تواصل</button>':'';
    return'<div class="wcard"><div class="wico wi-l"><i class="fas fa-triangle-exclamation"></i></div>'
     +'<div class="wbody"><h4>'+q(ط['اسم_الطالب']||'—')+' · <span style="font-weight:400;font-size:11px">'+q(ط['الحلقة']||'—')+'</span></h4>'
     +'<p>إنذار العتبة <strong>'+ط['رقم_العتبة']+'</strong> · المخالفات: <strong>'+ط['عدد_المخالفات']+'</strong> · الإجراء: <strong style="color:var(--p)">'+q(ط['الإجراء_المقترح']||'—')+'</strong></p>'
     +'</div><div class="wacts">'
     +'<select class="fi sm" id="adwP_'+q(ط['رقم_الطالب'])+'" style="font-size:11.5px"><option value="">الإجراء</option>'+opts+'<option value="__done__">✓ اكتمل</option></select>'
     +'<button class="pb sm" onclick="saveAdmW(\''+q(ط['رقم_الطالب'])+'\',\''+q(ط['اسم_الطالب'])+'\',\''+q(ط['الحلقة']||'')+'\','+ط['رقم_العتبة']+','+ط['عدد_المخالفات']+')"><i class="fas fa-save"></i> حفظ</button>'
     +btnWa+'</div></div>';
  }).join('');
}

function filterAdmW(c,q2){var l=arr(D._admNew);if(c)l=l.filter(function(ط){return ط['الحلقة']===c;});if(q2)l=l.filter(function(ط){return String(ط['اسم_الطالب']||'').includes(q2);});var e=document.getElementById('admWCards');if(e)e.innerHTML=buildAdmWCards(l);}

async function saveAdmW(id,name,circle,threshold,count){
  var sel=document.getElementById('adwP_'+id);var v2=sel?sel.value:'';if(!v2)return;
  var done=v2==='__done__';
  spin(true,'جارٍ تسجيل الإجراء…');
  var r=await api('تحديث_إجراء_انذار_اداري',{رقم_الطالب:id,اسم_الطالب:name,الحلقة:circle,نوع_الانذار:D.admType,رقم_العتبة:threshold,عدد_المخالفات:count,الإجراء:done?'مكتمل':v2,مكتمل:done});
  spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر التسجيل',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}
  Swal.fire({icon:'success',title:done?'تم إغلاق الإنذار':'تم تسجيل الإجراء',timer:1400,timerProgressBar:true,showConfirmButton:false});
  if(D.admWarnData)delete D.admWarnData[D.admType];
  await loadAdmWT(D.admType,null);
}

async function refreshAdmWarnings(){
  if(D.admWarnData)delete D.admWarnData[D.admType||'تأخر'];
  await loadAdmWT(D.admType||'تأخر',document.querySelector('#admWTabs .stab.active'));
}

function sendAdmWa(phone,sName,pName,threshold,count){var tpl=D.admTpl;var msg=buildMsg(tpl?tpl['نص_القالب']:'',{اسم_الطالب:sName,اسم_ولي_الطالب:pName,رقم_العتبة:threshold,عدد_الغيابات:count,تاريخ:hijri()});whatsapp(phone,msg);}

function pgAdminAllW(){
  var edu=arr(D.adminEduW),adm=arr(D.adminAdmW),map={};
  edu.forEach(function(a){var k=a['اسم_الطالب']||'؟';if(!map[k])map[k]={name:k,circle:a['الحلقة']||'—',stage:a['المرحلة_الدراسية']||'—',edu:[],late:[],abs:[],ex:[]};map[k].edu.push(a);});
  adm.forEach(function(a){var k=a['اسم_الطالب']||'؟';if(!map[k])map[k]={name:k,circle:a['الحلقة']||'—',stage:a['المرحلة_الدراسية']||'—',edu:[],late:[],abs:[],ex:[]};if(a['نوع_الانذار']==='تأخر')map[k].late.push(a);else if(a['نوع_الانذار']==='غياب')map[k].abs.push(a);else map[k].ex.push(a);});
  D.allWarnMap=map;
  var copts=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  var stages=[...new Set(Object.values(map).map(function(x){return x.stage;}).filter(function(x){return x&&x!=='—';}))];
  var sopts=stages.map(function(s){return'<option>'+s+'</option>';}).join('');
  mc('<div class="stitle"><i class="fas fa-list-check"></i> جميع الإنذارات</div>'
    +'<div class="cc"><div class="chdr"><h3>سجل شامل</h3>'
    +'<div class="cacts">'
    +'<select class="fi" id="awfC" onchange="applyAllWF()"><option value="">كل الحلق</option>'+copts+'</select>'
    +'<select class="fi" id="awfS" onchange="applyAllWF()"><option value="">كل المراحل</option>'+sopts+'</select>'
    +'<input class="fi" id="awfQ" placeholder="بحث باسم…" oninput="applyAllWF()" style="min-width:140px">'
    +'</div></div>'
    +'<div style="overflow-x:auto"><table class="dt"><thead><tr><th>الطالب</th><th>الحلقة</th><th>المرحلة</th><th>تأخر</th><th>غياب</th><th>غياب بعذر</th><th>تعليمية</th></tr></thead>'
    +'<tbody id="awBody">'+buildAllWRows(Object.values(map))+'</tbody></table></div></div>');
}

function buildAllWRows(list){
  if(!list.length)return'<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--ts)">لا توجد إنذارات</td></tr>';
  return list.map(function(s){return'<tr><td><strong>'+s.name+'</strong></td><td>'+s.circle+'</td><td>'+s.stage+'</td><td>'+(s.late.length?'<span class="bp bp-wa">'+s.late.length+'</span>':'—')+'</td><td>'+(s.abs.length?'<span class="bp bp-er">'+s.abs.length+'</span>':'—')+'</td><td>'+(s.ex.length?'<span class="bp bp-in">'+s.ex.length+'</span>':'—')+'</td><td>'+(s.edu.length?'<span class="bp bp-er">'+s.edu.length+' إنذار</span>':'—')+'</td></tr>';}).join('');
}

function applyAllWF(){var c=val('awfC'),st=val('awfS'),q2=val('awfQ');var l=Object.values(D.allWarnMap||{});if(c)l=l.filter(function(s){return s.circle===c;});if(st)l=l.filter(function(s){return s.stage===st;});if(q2)l=l.filter(function(s){return s.name.includes(q2);});var e=document.getElementById('awBody');if(e)e.innerHTML=buildAllWRows(l);}

function pgSettings(){
  var tpls=arr(D.templates),thr=arr(D.thresholds),procs=arr(D.procedures);
  var users=arr(D.setUsers),circles=arr(D.setCircles),states=arr(D.setStates),pages=arr(D.appPages);
  var tplH=tpls.map(function(t){return'<div class="cc mb-3" style="border:1px solid var(--bd)"><div class="chdr" style="padding:10px 15px"><h3 style="font-size:13px">'+q(t['عنوان_القالب']||t['نوع_القالب'])+'</h3><div class="cacts"><button class="ob sm" onclick="editTpl(\''+qj(t)+'\')"><i class="fas fa-pen"></i> تعديل</button></div></div><div style="padding:10px 15px;font-size:12.5px;color:var(--ts);white-space:pre-line;line-height:1.6;background:#f8f6f0">'+q(t['نص_القالب']||'')+'</div></div>';}).join('');
  var thrH=['تأخر','غياب','غياب_بعذر'].map(function(نوع){var l=thr.filter(function(e){return e['نوع_المخالفة']===نوع;});var rows=l.map(function(e){return'<tr><td>'+e['رقم_العتبة']+'</td><td><strong>'+e['عدد_المخالفات_للاستحقاق']+'</strong></td><td>'+(e['الإجراء_الافتراضي']||'—')+'</td><td><button class="ob sm" onclick="editThresh(\''+qj(e)+'\')"><i class="fas fa-pen"></i></button></td></tr>';}).join('');return'<h3 style="font-size:13px;font-weight:700;color:var(--p);margin:14px 0 8px">عتبات '+نوع+'</h3><div style="overflow-x:auto;margin-bottom:10px"><table class="dt"><thead><tr><th>العتبة</th><th>المخالفات</th><th>الإجراء</th><th>تعديل</th></tr></thead><tbody>'+rows+'</tbody></table></div><button class="ob sm" onclick="addThresh(\''+نوع+'\')"><i class="fas fa-plus"></i> إضافة</button>';}).join('<hr style="margin:14px 0;border-color:var(--bd)">');
  var procH=['تعليمي','تأخر','غياب','غياب_بعذر'].map(function(نوع){
    var displayName={'تعليمي':'إجراءات متابعة التعليمي','تأخر':'إجراءات التأخر','غياب':'إجراءات الغياب','غياب_بعذر':'إجراءات الغياب بعذر'}[نوع]||نوع;
    var l=procs.filter(function(e){return e['نوع_الاجراء']===نوع;});var pills=l.map(function(p){return'<span class="bp bp-in" style="padding:5px 12px;font-size:12.5px">'+q(p['اسم_الاجراء'])+'<button onclick="delProc(\''+q(p['اسم_الاجراء'])+'\')" style="background:none;border:none;color:var(--er);cursor:pointer;font-size:10px;margin-right:4px">×</button></span>';}).join('');return'<h3 style="font-size:13px;font-weight:700;color:var(--p);margin:14px 0 8px">'+displayName+'</h3><div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px">'+pills+'</div><button class="ob sm" onclick="addProc(\''+نوع+'\')"><i class="fas fa-plus"></i> إضافة</button>';}).join('<hr style="margin:14px 0;border-color:var(--bd)">');
  var userRows=users.map(function(u){
    var pCount=arr(u['صلاحيات']).filter(function(p){return p.can_view;}).length;
    return '<tr><td><strong>'+q(u['الاسم']||'—')+'</strong><div style="font-size:11px;color:var(--ts);direction:ltr;text-align:right">'+q(u['البريد']||'—')+'</div></td>'
      +'<td>'+roleLabel(u['الوظيفة'])+'</td><td>'+(u['الحلقة']||'—')+'</td><td>'+(u['رقم_الجوال']||'—')+'</td>'
      +'<td>'+(u['نشط']==='نعم'?'<span class="bp bp-ok">نشط</span>':'<span class="bp bp-gr">معطّل</span>')+'</td>'
      +'<td><span class="bp bp-in">'+pCount+' صفحة</span></td>'
      +'<td><button class="ob sm" onclick="editUser(\''+qj(u)+'\')"><i class="fas fa-pen"></i></button> '
      +'<button class="ob sm" onclick="editUserPerms(\''+qj(u)+'\')"><i class="fas fa-key"></i></button> '
      +'<button class="erb sm" onclick="deactUser(\''+q(u['الاسم'])+'\')"><i class="fas fa-ban"></i></button></td></tr>';
  }).join('');
  var circleC=circles.map(function(h){return'<div style="background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:10px 13px;display:flex;align-items:center;gap:8px"><i class="fas fa-mosque" style="color:var(--pl)"></i><span style="font-weight:700">'+q(h['اسم_الحلقة']||'—')+'</span><span style="font-size:11.5px;color:var(--ts)">'+q(h['المعلم']||'')+'</span><button onclick="delCircle(\''+q(h['اسم_الحلقة'])+'\')" style="background:none;border:none;color:var(--er);cursor:pointer"><i class="fas fa-times"></i></button></div>';}).join('');
  var stateC=states.map(function(s){return'<div style="background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:9px 13px;display:flex;align-items:center;gap:8px"><span style="width:11px;height:11px;border-radius:50%;background:'+(s['اللون']||'#888')+';display:inline-block"></span><span style="font-weight:700">'+q(s['اسم_الحالة'])+'</span><button onclick="delState(\''+q(s['اسم_الحالة'])+'\')" style="background:none;border:none;color:var(--er);cursor:pointer"><i class="fas fa-times"></i></button></div>';}).join('');
  mc('<div class="stitle"><i class="fas fa-gear"></i> الإعدادات</div>'
    +'<div class="cc"><div class="stabs" style="overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">'
    +'<button class="stab active" onclick="swST(this,\'stTpl\')"><i class="fas fa-comment-dots"></i> قوالب الإرسال</button>'
    +'<button class="stab" onclick="swST(this,\'stThr\')"><i class="fas fa-layer-group"></i> العتبات</button>'
    +'<button class="stab" onclick="swST(this,\'stProc\')"><i class="fas fa-list-check"></i> الإجراءات</button>'
    +'<button class="stab" onclick="swST(this,\'stUsers\')"><i class="fas fa-users-gear"></i> المستخدمون</button>'
    +'<button class="stab" onclick="swST(this,\'stCircles\')"><i class="fas fa-mosque"></i> الحلق</button>'
    +'<button class="stab" onclick="swST(this,\'stStates\')"><i class="fas fa-circle-dot"></i> الحالات</button>'
    +'<button class="stab" onclick="swST(this,\'stEduR\')"><i class="fas fa-triangle-exclamation"></i> أسباب الإنذارات التعليمية</button>'
    +'<button class="stab" onclick="swST(this,\'stEduAssess\')"><i class="fas fa-sliders"></i> إعدادات التقييم التعليمي</button>'
    +'</div>'
    +'<div class="spanel active cbody" id="stTpl"><p style="font-size:12px;color:var(--ts);margin-bottom:14px">المتغيرات: <code>#اسم_الطالب</code> <code>#اسم_ولي_الطالب</code> <code>#السبب</code> <code>#تاريخ</code> <code>#رقم_العتبة</code> <code>#عدد_الغيابات</code></p>'+tplH+'</div>'
    +'<div class="spanel cbody" id="stThr">'+thrH+'</div>'
    +'<div class="spanel cbody" id="stProc">'+procH+'</div>'
    +'<div class="spanel cbody" id="stUsers"><div class="mb-3"><button class="pb sm" onclick="addUser()"><i class="fas fa-user-plus"></i> إضافة مستخدم</button></div><div style="overflow-x:auto"><table class="dt"><thead><tr><th>الاسم</th><th>الوظيفة</th><th>الحلقة</th><th>الجوال</th><th>الحالة</th><th>الصلاحيات</th><th>إجراء</th></tr></thead><tbody>'+userRows+'</tbody></table></div></div>'
    +'<div class="spanel cbody" id="stCircles"><div class="mb-3"><button class="pb sm" onclick="addCircle()"><i class="fas fa-plus"></i> إضافة حلقة</button></div><div style="display:flex;flex-wrap:wrap;gap:10px">'+circleC+'</div></div>'
    +'<div class="spanel cbody" id="stStates"><div class="mb-3"><button class="pb sm" onclick="addState()"><i class="fas fa-plus"></i> إضافة حالة</button></div><div style="display:flex;flex-wrap:wrap;gap:10px">'+stateC+'</div></div>'
    +'<div class="spanel cbody" id="stEduR">'+buildEduReasonsPanel()+'</div>'
    +'<div class="spanel cbody" id="stEduAssess">'+buildEduAssessmentSettingsPanel()+'</div>'
    +'</div>');
}

async function reloadSettings(){
  spin(true,'جارٍ التحميل…');
  var rs=await Promise.all([api('جلب_قوالب_الرسائل',{}),api('جلب_عتبات_الانذارات',{}),api('جلب_الاجراءات',{}),api('جلب_العاملين',{}),api('جلب_الحلق',{}),api('جلب_حالات_الطالب',{}),api('جلب_صفحات_النظام',{}),api('جلب_اعدادات_التقييم_التعليمي',{})]);
  spin(false);
  D.templates=arr(rs[0].قوالب);D.thresholds=arr(rs[1].عتبات);D.procedures=arr(rs[2].إجراءات);
  D.setUsers=arr(rs[3].عاملون);D.setCircles=arr(rs[4].حلق);D.setStates=arr(rs[5].حالات);D.appPages=arr(rs[6].صفحات);D.eduAssessSettings=(rs[7]&&rs[7].إعدادات)||D.eduAssessSettings||{};
  saveCache();pgSettings();
}

async function editTpl(s){var t=JSON.parse(decodeURIComponent(s));var res=await Swal.fire({title:'تعديل: '+q(t['عنوان_القالب']||''),html:'<textarea id="ti" class="swal2-textarea" style="font-family:Tajawal;direction:rtl;height:150px;width:100%">'+q(t['نص_القالب']||'')+'</textarea>',confirmButtonText:'حفظ',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){return document.getElementById('ti').value.trim();}});if(!res.isConfirmed||!res.value)return;spin(true);await api('حفظ_قالب_رسالة',{_صف:t['_صف'],عنوان_القالب:t['عنوان_القالب'],نص_القالب:res.value});spin(false);await reloadSettings();}

async function editThresh(s){var e=JSON.parse(decodeURIComponent(s));var res=await Swal.fire({title:'عتبة '+e['نوع_المخالفة']+' #'+e['رقم_العتبة'],html:'<div style="direction:rtl;display:grid;gap:10px"><div><label style="font-size:12px;font-weight:600">عدد المخالفات</label><input id="tc" type="number" class="swal2-input" value="'+e['عدد_المخالفات_للاستحقاق']+'" style="font-family:Tajawal;width:100%;margin:0"></div><div><label style="font-size:12px;font-weight:600">الإجراء</label><input id="tp" type="text" class="swal2-input" value="'+q(e['الإجراء_الافتراضي']||'')+'" style="font-family:Tajawal;width:100%;margin:0;direction:rtl"></div></div>',confirmButtonText:'حفظ',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){return{count:val('tc'),proc:val('tp')};}}); if(!res.isConfirmed||!res.value)return;spin(true);await api('حفظ_عتبات_الانذارات',{نوع_المخالفة:e['نوع_المخالفة'],عتبات:[{نوع_المخالفة:e['نوع_المخالفة'],رقم_العتبة:e['رقم_العتبة'],عدد_المخالفات_للاستحقاق:res.value.count,الإجراء_الافتراضي:res.value.proc}]});spin(false);await reloadSettings();}

async function addThresh(نوع){var res=await Swal.fire({title:'إضافة عتبة - '+نوع,html:'<div style="direction:rtl;display:grid;gap:10px"><div><label style="font-size:12px;font-weight:600">رقم العتبة</label><input id="tn" type="number" class="swal2-input" min="1" style="font-family:Tajawal;width:100%;margin:0"></div><div><label style="font-size:12px;font-weight:600">عدد المخالفات</label><input id="tc" type="number" class="swal2-input" min="1" style="font-family:Tajawal;width:100%;margin:0"></div><div><label style="font-size:12px;font-weight:600">الإجراء</label><input id="tp" type="text" class="swal2-input" style="font-family:Tajawal;width:100%;margin:0;direction:rtl"></div></div>',confirmButtonText:'إضافة',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){return{رقم_العتبة:val('tn'),عدد_المخالفات_للاستحقاق:val('tc'),الإجراء_الافتراضي:val('tp')};}}); if(!res.isConfirmed||!res.value)return;spin(true);await api('حفظ_عتبات_الانذارات',{نوع_المخالفة:نوع,عتبات:[Object.assign({نوع_المخالفة:نوع},res.value)]});spin(false);await reloadSettings();}

async function addProc(نوع){var res=await Swal.fire({title:'إضافة إجراء - '+نوع,input:'text',inputPlaceholder:'اسم الإجراء',inputAttributes:{style:'font-family:Tajawal;direction:rtl'},confirmButtonText:'إضافة',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(v2){if(!v2||!v2.trim())return Swal.showValidationMessage('لا يمكن أن يكون فارغاً');return v2.trim();}}); if(!res.isConfirmed||!res.value)return;spin(true);await api('إضافة_إجراء',{نوع_الاجراء:نوع,اسم_الاجراء:res.value});spin(false);await reloadSettings();}

async function delProc(name){var r=await Swal.fire({title:'حذف الإجراء؟',text:name,showCancelButton:true,confirmButtonColor:'#c0392b',confirmButtonText:'حذف',cancelButtonText:'إلغاء',customClass:{popup:'swal-rtl'}});if(!r.isConfirmed)return;spin(true);await api('حذف_إجراء',{اسم_الاجراء:name});spin(false);await reloadSettings();}

function roleOptions(selected){
  var roles=[['معلم','معلم'],['مسمع_تعليمي','مسمع تعليمي'],['مساعد_معلم','مساعد معلم'],['مساعد_خارجي','مساعد خارجي'],['مشرف_تعليمي','مشرف تعليمي'],['مشرف_اداري','مشرف إداري'],['مدير','مدير']];
  return roles.map(function(r){return '<option value="'+r[0]+'" '+(selected===r[0]?'selected':'')+'>'+r[1]+'</option>';}).join('');
}
function circleOptions(selected){return arr(D.setCircles).map(function(h){var n=h['اسم_الحلقة'];return'<option value="'+q(n)+'" '+(selected===n?'selected':'')+'>'+q(n)+'</option>';}).join('');}

async function addUser(){
  var res=await Swal.fire({title:'إضافة مستخدم',width:'560px',html:'<div style="direction:rtl;display:grid;gap:10px;text-align:right">'
    +sField('البريد الموجود في Supabase Auth','nu_email','','email',false)+sField('الاسم','nu_n','','text',false)
    +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الوظيفة</label><select id="nu_r" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0">'+roleOptions('معلم')+'</select></div>'
    +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الحلقة</label><select id="nu_c" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="">—</option>'+circleOptions('')+'</select></div>'+sField('رقم الجوال','nu_p','','text',false)
    +'<div style="font-size:12px;color:var(--ts);line-height:1.6;background:#fafaf8;border:1px solid var(--bd);border-radius:10px;padding:10px">أنشئ المستخدم أولًا من Supabase Authentication، ثم اربطه هنا بالبريد.</div></div>',confirmButtonText:'إضافة/ربط',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){var email=val('nu_email'),n=val('nu_n');if(!email||!n)return Swal.showValidationMessage('البريد والاسم مطلوبان');return{البريد:email,الاسم:n,الوظيفة:val('nu_r'),الحلقة:val('nu_c'),رقم_الجوال:val('nu_p')};}});
  if(!res.isConfirmed||!res.value)return;spin(true,'جارٍ الربط…');var r=await api('إضافة_عامل',res.value);spin(false);if(!r.نجاح){Swal.fire({icon:'error',title:'تعذر الإضافة',text:r.خطأ||'حدث خطأ',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}await reloadSettings();
}

async function editUser(s){
  var u=JSON.parse(decodeURIComponent(s));
  var res=await Swal.fire({title:'تعديل: '+q(u['الاسم']),width:'560px',html:'<div style="direction:rtl;display:grid;gap:10px;text-align:right">'
    +sField('الاسم','eu_n',u['الاسم']||'','text',false)
    +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الوظيفة</label><select id="eu_r" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0">'+roleOptions(u['الوظيفة'])+'</select></div>'
    +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الحلقة</label><select id="eu_c" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="">—</option>'+circleOptions(u['الحلقة'])+'</select></div>'+sField('رقم الجوال','eu_p',u['رقم_الجوال']||'','text',false)
    +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الحالة</label><select id="eu_active" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="نعم" '+(u['نشط']==='نعم'?'selected':'')+'>نشط</option><option value="لا" '+(u['نشط']!=='نعم'?'selected':'')+'>معطّل</option></select></div></div>',confirmButtonText:'حفظ',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){return{معرف:u['معرف'],البريد:u['البريد'],الاسم:val('eu_n'),الوظيفة:val('eu_r'),الحلقة:val('eu_c'),رقم_الجوال:val('eu_p'),نشط:val('eu_active')};}});
  if(!res.isConfirmed||!res.value)return;spin(true,'جارٍ الحفظ…');var r=await api('تعديل_عامل',res.value);spin(false);if(!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:r.خطأ||'حدث خطأ',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}await reloadSettings();
}

async function editUserPerms(s){
  var u=JSON.parse(decodeURIComponent(s)),perms=arr(u['صلاحيات']),map={};perms.forEach(function(p){map[p.page_key]=p;});
  function rowAllChecked(p){return !!(p.can_view&&p.can_create&&p.can_update&&p.can_delete);}
  var groups={};
  arr(D.appPages).slice().sort(function(a,b){
    var ga=(a.page_group||'عام'), gb=(b.page_group||'عام');
    if(ga!==gb)return ga.localeCompare(gb,'ar');
    return (Number(a.sort_order||0)-Number(b.sort_order||0)) || String(a.page_title||'').localeCompare(String(b.page_title||''),'ar');
  }).forEach(function(pg){
    var g=pg.page_group||'عام'; if(!groups[g])groups[g]=[]; groups[g].push(pg);
  });
  var html='<div style="direction:rtl;text-align:right;max-height:62vh;overflow:auto;padding-left:4px">'
    +'<div style="font-size:12px;color:var(--ts);line-height:1.7;background:#fafaf8;border:1px solid var(--bd);border-radius:12px;padding:10px;margin-bottom:10px">'
    +'رتبت الصلاحيات حسب الأقسام. زر <b>الكل</b> في كل صفحة يحدد: عرض + إضافة + تعديل + حذف، وزر <b>كل القسم</b> يحدد كل صفحات القسم.</div>';
  Object.keys(groups).forEach(function(g,gi){
    var rows=groups[g].map(function(pg){
      var p=map[pg.page_key]||{};
      return '<tr data-group="'+q(g)+'" data-page="'+q(pg.page_key)+'">'
        +'<td><strong>'+q(pg.page_title)+'</strong><div style="font-size:11px;color:var(--ts)">'+q(pg.page_key||'')+'</div></td>'
        +'<td style="text-align:center"><input type="checkbox" class="permAll" data-page="'+q(pg.page_key)+'" '+(rowAllChecked(p)?'checked':'')+' onchange="togglePermRow(this)"></td>'
        +'<td style="text-align:center"><input type="checkbox" class="permv" data-group="'+q(g)+'" data-page="'+q(pg.page_key)+'" data-act="can_view" '+(p.can_view?'checked':'')+' onchange="syncPermRow(\''+q(pg.page_key)+'\');syncPermGroup(\''+q(g)+'\')"></td>'
        +'<td style="text-align:center"><input type="checkbox" class="permv" data-group="'+q(g)+'" data-page="'+q(pg.page_key)+'" data-act="can_create" '+(p.can_create?'checked':'')+' onchange="syncPermRow(\''+q(pg.page_key)+'\');syncPermGroup(\''+q(g)+'\')"></td>'
        +'<td style="text-align:center"><input type="checkbox" class="permv" data-group="'+q(g)+'" data-page="'+q(pg.page_key)+'" data-act="can_update" '+(p.can_update?'checked':'')+' onchange="syncPermRow(\''+q(pg.page_key)+'\');syncPermGroup(\''+q(g)+'\')"></td>'
        +'<td style="text-align:center"><input type="checkbox" class="permv" data-group="'+q(g)+'" data-page="'+q(pg.page_key)+'" data-act="can_delete" '+(p.can_delete?'checked':'')+' onchange="syncPermRow(\''+q(pg.page_key)+'\');syncPermGroup(\''+q(g)+'\')"></td>'
        +'</tr>';
    }).join('');
    html+='<div class="cc" style="margin-bottom:10px;overflow:hidden"><div class="chdr" style="cursor:pointer" onclick="var b=this.nextElementSibling;b.style.display=b.style.display===\'none\'?\'block\':\'none\';">'
      +'<h3><i class="fas fa-folder-open"></i> '+q(g)+'</h3><div class="cacts"><label class="bp" style="cursor:pointer"><input type="checkbox" class="permGroupAll" data-group="'+q(g)+'" onchange="togglePermGroup(event,this)"> كل القسم</label></div></div>'
      +'<div class="cbody" style="padding:0;display:'+(gi===0?'block':'block')+'"><table class="dt"><thead><tr><th>الصفحة</th><th>الكل</th><th>عرض</th><th>إضافة</th><th>تعديل</th><th>حذف</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  });
  html+='</div>';
  var res=await Swal.fire({title:'صلاحيات: '+q(u['الاسم']),width:'900px',html:html,confirmButtonText:'حفظ الصلاحيات',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},didOpen:function(){document.querySelectorAll('.permGroupAll').forEach(function(x){syncPermGroup(x.dataset.group);});},preConfirm:function(){var out={};document.querySelectorAll('.permv').forEach(function(ch){var pg=ch.dataset.page,act=ch.dataset.act;if(!out[pg])out[pg]={page_key:pg,can_view:false,can_create:false,can_update:false,can_delete:false};out[pg][act]=ch.checked;});return Object.keys(out).map(function(k){return out[k];});}});
  if(!res.isConfirmed)return;spin(true,'جارٍ حفظ الصلاحيات…');var r=await api('حفظ_صلاحيات_عامل',{معرف:u['معرف'],صلاحيات:res.value});spin(false);if(!r.نجاح){Swal.fire({icon:'error',title:'تعذر حفظ الصلاحيات',text:r.خطأ||'حدث خطأ',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}if(D.user&&u['معرف']===D.user.id){var me=await api('جلب_ملفي',{});if(me&&me.id){D.user.permissions=arr(me.permissions);D.user.is_super_admin=!!me.is_super_admin;if(typeof buildSidebar==='function')buildSidebar();}}await reloadSettings();
}
function togglePermRow(cb){
  var pg=cb.dataset.page;
  document.querySelectorAll('.permv[data-page="'+pg+'"]').forEach(function(x){x.checked=cb.checked;});
  var one=document.querySelector('.permv[data-page="'+pg+'"]'); if(one)syncPermGroup(one.dataset.group);
}
function syncPermRow(pg){
  var all=true;
  document.querySelectorAll('.permv[data-page="'+pg+'"]').forEach(function(x){if(!x.checked)all=false;});
  var a=document.querySelector('.permAll[data-page="'+pg+'"]');
  if(a)a.checked=all;
}
function togglePermGroup(ev,cb){
  if(ev)ev.stopPropagation();
  var g=cb.dataset.group;
  document.querySelectorAll('.permv[data-group="'+g+'"]').forEach(function(x){x.checked=cb.checked;});
  document.querySelectorAll('tr[data-group="'+g+'"]').forEach(function(tr){syncPermRow(tr.dataset.page);});
}
function syncPermGroup(g){
  var all=true, any=false;
  document.querySelectorAll('.permv[data-group="'+g+'"]').forEach(function(x){any=true;if(!x.checked)all=false;});
  var cb=document.querySelector('.permGroupAll[data-group="'+g+'"]');
  if(cb){cb.checked=!!(any&&all);}
}

async function deactUser(name){var r=await Swal.fire({title:'تعطيل حساب؟',text:name,showCancelButton:true,confirmButtonColor:'#c0392b',confirmButtonText:'تعطيل',cancelButtonText:'إلغاء',customClass:{popup:'swal-rtl'}});if(!r.isConfirmed)return;spin(true);await api('حذف_عامل',{الاسم:name});spin(false);await reloadSettings();}

async function addCircle(){var res=await Swal.fire({title:'إضافة حلقة',html:'<div style="direction:rtl;display:grid;gap:10px;text-align:right">'+sField('اسم الحلقة','nc_n','','text',false)+sField('المعلم','nc_t','','text',false)+'</div>',confirmButtonText:'إضافة',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){var n=val('nc_n');if(!n)return Swal.showValidationMessage('اسم الحلقة مطلوب');return{اسم_الحلقة:n,المعلم:val('nc_t')};}}); if(!res.isConfirmed||!res.value)return;spin(true);await api('إضافة_حلقة',res.value);spin(false);await reloadSettings();}

async function delCircle(name){var r=await Swal.fire({title:'حذف الحلقة؟',text:name,showCancelButton:true,confirmButtonColor:'#c0392b',confirmButtonText:'حذف',cancelButtonText:'إلغاء',customClass:{popup:'swal-rtl'}});if(!r.isConfirmed)return;spin(true);await api('حذف_حلقة',{اسم_الحلقة:name});spin(false);await reloadSettings();}

async function addState(){var res=await Swal.fire({title:'إضافة حالة',html:'<div style="direction:rtl;display:grid;gap:10px;text-align:right">'+sField('اسم الحالة','ss_n','','text',false)+'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">اللون</label><input id="ss_c" type="color" value="#1e7e4a" style="width:100%;height:38px;border:1px solid var(--bd);border-radius:8px;cursor:pointer"></div></div>',confirmButtonText:'إضافة',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){var n=val('ss_n');if(!n)return Swal.showValidationMessage('اسم الحالة مطلوب');return{اسم_الحالة:n,اللون:document.getElementById('ss_c').value};}}); if(!res.isConfirmed||!res.value)return;spin(true);await api('إضافة_حالة_طالب',res.value);spin(false);await reloadSettings();}

function buildEduReasonsPanel(){
  var reasons=arr(D.eduReasons);
  var pills=reasons.map(function(r){
    return '<span class="bp bp-er" style="padding:5px 12px;font-size:12.5px">'+q(r)
      +'<button onclick="delEduReason(\''+q(r)+'\')" style="background:none;border:none;color:#fff;cursor:pointer;font-size:10px;margin-right:6px;opacity:.8">×</button></span>';
  }).join('');
  return '<p style="font-size:12.5px;color:var(--ts);margin-bottom:14px">'
    +'هذه الأسباب تظهر في قائمة الإنذارات التعليمية عند إصدار إنذار من صفحة الحلق والطلاب</p>'
    +'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">'+pills+'</div>'
    +'<button class="pb sm" onclick="addEduReason()"><i class="fas fa-plus"></i> إضافة سبب</button>';
}

async function addEduReason(){
  var res=await Swal.fire({
    title:'إضافة سبب إنذار تعليمي',
    input:'text',
    inputPlaceholder:'مثال: إخلال بنظام الحلقة',
    inputAttributes:{style:'font-family:Tajawal;direction:rtl'},
    confirmButtonText:'إضافة',
    cancelButtonText:'إلغاء',
    showCancelButton:true,
    confirmButtonColor:'#1a3c5e',
    customClass:{popup:'swal-rtl'},
    preConfirm:function(v2){
      if(!v2 || !v2.trim()) return Swal.showValidationMessage('لا يمكن أن يكون فارغاً');
      return v2.trim();
    }
  });

  if(!res.isConfirmed || !res.value) return;

  spin(true);
  await api('إضافة_إجراء',{نوع_الاجراء:'سبب_تعليمي',اسم_الاجراء:res.value});
  spin(false);

  D.eduReasons = D.eduReasons || [];
  D.eduReasons.push(res.value);

  saveCache();
  var p=document.getElementById('stEduR');
  if(p) p.innerHTML = buildEduReasonsPanel();

  Swal.fire({icon:'success',title:'تمت الإضافة',timer:1800,timerProgressBar:true,showConfirmButton:false});
}

async function delEduReason(name){
  var r=await Swal.fire({
    title:'حذف السبب؟',
    text:name,
    showCancelButton:true,
    confirmButtonColor:'#c0392b',
    confirmButtonText:'حذف',
    cancelButtonText:'إلغاء',
    customClass:{popup:'swal-rtl'}
  });
  if(!r.isConfirmed) return;

  spin(true);
  await api('حذف_إجراء',{اسم_الاجراء:name});
  spin(false);

  D.eduReasons = (D.eduReasons || []).filter(function(x){ return x !== name; });

  saveCache();
  var p=document.getElementById('stEduR');
  if(p) p.innerHTML = buildEduReasonsPanel();

  Swal.fire({icon:'success',title:'تم الحذف',timer:1500,timerProgressBar:true,showConfirmButton:false});
}

async function delState(name){var r=await Swal.fire({title:'حذف الحالة؟',text:name,showCancelButton:true,confirmButtonColor:'#c0392b',confirmButtonText:'حذف',cancelButtonText:'إلغاء',customClass:{popup:'swal-rtl'}});if(!r.isConfirmed)return;spin(true);await api('حذف_حالة_طالب',{اسم_الحالة:name});spin(false);await reloadSettings();}


// ══════════════════════════════════════════════════════
// Phase 3E — الفصول والبرامج
// ══════════════════════════════════════════════════════
async function pgLearningTerms(){
  mc('<div class="stitle"><i class="fas fa-calendar-days"></i> الفصول والبرامج</div>'
    +'<div class="cc"><div class="chdr"><h3>إدارة الفترات التعليمية</h3><div class="cacts">'
    +'<button class="pb sm" onclick="openLearningTermModal()"><i class="fas fa-plus"></i> إضافة فترة</button>'
    +'<button class="ob sm" onclick="loadLearningTerms()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'</div></div>'
    +'<div class="cbody" id="termsSummary"><div class="empty"><div class="spri"></div><h3>جارٍ تحميل الفترات…</h3></div></div>'
    +'<div style="overflow-x:auto"><table class="dt"><thead><tr>'
    +'<th>الفترة</th><th>النوع</th><th>المدة</th><th>الحالة</th><th>سجلات التحضير</th><th>الأرشيف</th><th>إجراء</th>'
    +'</tr></thead><tbody id="termsBody"><tr><td colspan="7" style="text-align:center;padding:18px"><div class="spri" style="margin:auto"></div></td></tr></tbody></table></div></div>');
  await loadLearningTerms();
}

async function loadLearningTerms(){
  var body=document.getElementById('termsBody'),sum=document.getElementById('termsSummary');
  if(body)body.innerHTML='<tr><td colspan="7" style="text-align:center;padding:18px"><div class="spri" style="margin:auto"></div></td></tr>';
  var r=await api('جلب_الفصول_والبرامج',{});
  if(!r||!r.نجاح){
    if(body)body.innerHTML='<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--er)">'+q((r&&r.خطأ)||'تعذر تحميل الفترات')+'</td></tr>';
    return;
  }
  D.learningTerms=arr(r.فترات);
  D.currentTerm=r.الفترة_الحالية||{};
  if(sum)sum.innerHTML=buildTermsSummary(D.currentTerm,D.learningTerms);
  if(body)body.innerHTML=buildTermRows(D.learningTerms);
}

function buildTermsSummary(cur,list){
  var active=arr(list).filter(function(t){return t['نشط'];}).length;
  var name=(cur&&cur['اسم_الفترة'])||'لا توجد فترة نشطة';
  var range=(cur&&cur['تاريخ_البداية'])?cur['تاريخ_البداية']+' إلى '+cur['تاريخ_النهاية']:'—';
  return '<div class="kpi-grid" style="margin-bottom:0">'
    +kpiCard('الفترة الحالية',name,'fa-calendar-check','')
    +kpiCard('المدة',range,'fa-calendar-days','kpi-ac')
    +kpiCard('عدد الفترات',arr(list).length,'fa-layer-group','')
    +kpiCard('الفترات النشطة',active,'fa-toggle-on',active===1?'kpi-ok':'kpi-wa')
    +'</div>'
    +'<p style="font-size:12.5px;color:var(--ts);margin:12px 4px 0;line-height:1.7">التحضير اليومي يرتبط تلقائيًا بالفترة النشطة حسب التاريخ. عند نهاية الفصل أو البرنامج استخدم زر الإغلاق مع الأرشفة لحفظ إجماليات الطلاب.</p>';
}

function buildTermRows(list){
  if(!list.length)return '<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--ts)">لا توجد فترات</td></tr>';
  return list.map(function(t){
    var active=t['نشط']?'<span class="bp bp-ok">نشطة</span>':'<span class="bp bp-gr">مغلقة/غير نشطة</span>';
    var qterm=qj(t);
    return '<tr>'
      +'<td><strong>'+q(t['اسم_الفترة']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+q(t['ملاحظات']||'')+'</div></td>'
      +'<td><span class="bp bp-in">'+q(t['نوع_الفترة']||'—')+'</span></td>'
      +'<td><div>'+q(t['تاريخ_البداية']||'—')+'</div><div style="font-size:11px;color:var(--ts)">'+q(t['تاريخ_النهاية']||'—')+'</div></td>'
      +'<td>'+active+'</td>'
      +'<td><strong>'+(t['عدد_سجلات_التحضير']||0)+'</strong></td>'
      +'<td><strong>'+(t['عدد_الطلاب_المؤرشفين']||0)+'</strong> طالب</td>'
      +'<td style="white-space:nowrap">'
      +'<button class="ob sm" onclick="openLearningTermModal(\''+qterm+'\')" title="تعديل"><i class="fas fa-pen"></i></button> '
      +(!t['نشط']?'<button class="ob sm" onclick="activateLearningTerm(\''+q(t.id)+'\')" title="تفعيل"><i class="fas fa-toggle-on"></i></button> ':'')
      +'<button class="ob sm" onclick="archiveLearningTerm(\''+q(t.id)+'\')" title="أرشفة"><i class="fas fa-box-archive"></i></button> '
      +'<button class="erb sm" onclick="closeLearningTerm(\''+q(t.id)+'\')" title="إغلاق"><i class="fas fa-lock"></i></button> '
      +'<button class="erb sm" onclick="deleteLearningTerm(\''+q(t.id)+'\')" title="حذف الفارغة فقط"><i class="fas fa-trash"></i></button>'
      +'</td></tr>';
  }).join('');
}

function termTypeOptions(sel){
  return ['فصل دراسي','برنامج صيفي','برنامج خاص'].map(function(x){return '<option '+(x===sel?'selected':'')+'>'+x+'</option>';}).join('');
}

async function openLearningTermModal(s){
  var t=s?JSON.parse(decodeURIComponent(s)):{};
  var today=new Date().toISOString().slice(0,10);
  var end=new Date();end.setMonth(end.getMonth()+4);var endISO=end.toISOString().slice(0,10);
  var res=await Swal.fire({
    title:(t.id?'تعديل فترة':'إضافة فترة'),
    width:'620px',
    html:'<div style="direction:rtl;display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:right">'
      +'<div style="grid-column:1/-1"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">اسم الفترة</label><input id="lt_name" class="swal2-input" style="font-family:Tajawal;width:100%;margin:0;direction:rtl" value="'+q(t['اسم_الفترة']||'')+'" placeholder="مثال: الفصل الأول 1447"></div>'
      +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">نوع الفترة</label><select id="lt_type" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0">'+termTypeOptions(t['نوع_الفترة']||'فصل دراسي')+'</select></div>'
      +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">الحالة</label><select id="lt_active" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="false" '+(!t['نشط']?'selected':'')+'>غير نشطة</option><option value="true" '+(t['نشط']?'selected':'')+'>نشطة</option></select></div>'
      +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">تاريخ البداية</label><input id="lt_start" type="date" class="swal2-input" style="font-family:Tajawal;width:100%;margin:0" value="'+q(t['تاريخ_البداية']||today)+'"></div>'
      +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">تاريخ النهاية</label><input id="lt_end" type="date" class="swal2-input" style="font-family:Tajawal;width:100%;margin:0" value="'+q(t['تاريخ_النهاية']||endISO)+'"></div>'
      +'<div style="grid-column:1/-1"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">ملاحظات</label><textarea id="lt_notes" class="swal2-textarea" style="font-family:Tajawal;width:100%;height:90px;margin:0;direction:rtl" placeholder="اختياري">'+q(t['ملاحظات']||'')+'</textarea></div>'
      +'<div style="grid-column:1/-1;font-size:12px;color:var(--ts);background:#fafaf8;border:1px solid var(--bd);border-radius:10px;padding:10px;line-height:1.7">عند جعل هذه الفترة نشطة، سيتم تعطيل بقية الفترات تلقائيًا.</div>'
      +'</div>',
    confirmButtonText:'حفظ',cancelButtonText:'إلغاء',showCancelButton:true,confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},
    preConfirm:function(){
      var n=val('lt_name'), st=val('lt_start'), en=val('lt_end');
      if(!n)return Swal.showValidationMessage('اسم الفترة مطلوب');
      if(!st||!en)return Swal.showValidationMessage('تاريخ البداية والنهاية مطلوبان');
      return {id:t.id||'',اسم_الفترة:n,نوع_الفترة:val('lt_type'),تاريخ_البداية:st,تاريخ_النهاية:en,نشط:val('lt_active'),ملاحظات:val('lt_notes')};
    }
  });
  if(!res.isConfirmed||!res.value)return;
  spin(true,'جارٍ حفظ الفترة…');
  var r=await api('حفظ_فصل_او_برنامج',res.value);
  spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:(r&&r.خطأ)||'حدث خطأ',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}
  await loadLearningTerms();
  Swal.fire({icon:'success',title:'تم الحفظ',timer:1600,timerProgressBar:true,showConfirmButton:false});
}

async function activateLearningTerm(id){
  var res=await Swal.fire({icon:'question',title:'تفعيل هذه الفترة؟',text:'سيتم تعطيل أي فترة نشطة أخرى.',showCancelButton:true,confirmButtonText:'تفعيل',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ التفعيل…');var r=await api('تفعيل_فترة_تعلم',{id:id});spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر التفعيل',text:(r&&r.خطأ)||'حدث خطأ'});return;}
  await loadLearningTerms();
}

async function archiveLearningTerm(id){
  var res=await Swal.fire({icon:'question',title:'أرشفة نتائج الفترة؟',text:'سيتم حفظ إجماليات الحضور والحفظ لكل طالب في أرشيف الفترة.',showCancelButton:true,confirmButtonText:'أرشفة',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ الأرشفة…');var r=await api('أرشفة_فترة_تعلم',{id:id});spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الأرشفة',text:(r&&r.خطأ)||'حدث خطأ'});return;}
  await loadLearningTerms();
  Swal.fire({icon:'success',title:'تمت الأرشفة',text:'عدد الطلاب: '+(r['عدد_الطلاب']||0),timer:2000,timerProgressBar:true,showConfirmButton:false});
}

async function closeLearningTerm(id){
  var res=await Swal.fire({icon:'warning',title:'إغلاق الفترة؟',html:'<div style="direction:rtl;text-align:right"><p>سيتم تعطيل الفترة. يفضل ترك خيار الأرشفة مفعلاً لحفظ نتائج الطلاب.</p><label style="display:flex;align-items:center;gap:8px;justify-content:center"><input id="closeArchive" type="checkbox" checked> أرشفة النتائج قبل الإغلاق</label></div>',showCancelButton:true,confirmButtonText:'إغلاق',cancelButtonText:'إلغاء',confirmButtonColor:'#c0392b',customClass:{popup:'swal-rtl'},preConfirm:function(){return {أرشفة:document.getElementById('closeArchive').checked};}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ إغلاق الفترة…');var r=await api('إغلاق_فترة_تعلم',{id:id,أرشفة:String(res.value.أرشفة)});spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الإغلاق',text:(r&&r.خطأ)||'حدث خطأ'});return;}
  await loadLearningTerms();
  Swal.fire({icon:'success',title:'تم الإغلاق',timer:1800,timerProgressBar:true,showConfirmButton:false});
}

async function deleteLearningTerm(id){
  var res=await Swal.fire({icon:'warning',title:'حذف الفترة؟',text:'يسمح بالحذف فقط إذا لم تكن لها سجلات تحضير.',showCancelButton:true,confirmButtonText:'حذف',cancelButtonText:'إلغاء',confirmButtonColor:'#c0392b',customClass:{popup:'swal-rtl'}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ الحذف…');var r=await api('حذف_فترة_تعلم',{id:id});spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحذف',text:(r&&r.خطأ)||'حدث خطأ',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});return;}
  await loadLearningTerms();
}


// =====================================================================
// Phase 4D — إعدادات التقييم التعليمي في صفحة المشرف الإداري
// =====================================================================
function buildEduAssessmentSettingsPanel(){
  if(!D.eduAssessSettings || !Array.isArray(D.eduAssessSettings['حلق_الربط'])){
    setTimeout(loadEduAssessmentSettingsInline,30);
    return '<div class="empty" style="padding:30px 10px"><div class="spri" style="margin:0 auto 10px"></div><h3>جارٍ تحميل إعدادات التقييم…</h3></div>';
  }
  var st=D.eduAssessSettings||{};
  var enabled={};arr(st['حلق_الربط']).forEach(function(x){enabled[x['اسم_الحلقة']]=!!x['مفعل'];});
  var circles=arr(D.setCircles).map(function(c){var n=c['اسم_الحلقة'];return '<label style="display:flex;align-items:center;gap:7px;background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:8px 10px"><input type="checkbox" class="eduRabtCircle" value="'+q(n)+'" '+(enabled[n]?'checked':'')+'> <span>'+q(n)+'</span></label>';}).join('');
  return '<div style="display:grid;gap:14px;max-width:780px">'
    +'<div class="kpi-grid" style="margin-bottom:0">'
    +'<div class="kpi-card"><div class="klabel">أقل درجة للنجاح في الربط</div><input id="eduRabtPass" type="number" min="0" max="10" step="0.25" class="fi" value="'+q(st['اقل_درجة_الربط']||7)+'"></div>'
    +'<div class="kpi-card"><div class="klabel">أقل درجة للنجاح في الاختبار</div><input id="eduTestPass" type="number" min="0" max="10" step="0.25" class="fi" value="'+q(st['اقل_درجة_الاختبار']||7)+'"></div>'
    +'<div class="kpi-card"><div class="klabel">عدد الاختبارات الافتراضي بالفترة</div><input id="eduTestCount" type="number" min="1" max="20" class="fi" value="'+q(st['عدد_الاختبارات']||3)+'"></div>'
    +'</div>'
    +'<div class="cc" style="margin:0"><div class="chdr"><h3>الحلق المطلوب عليها عرض الربط</h3></div><div class="cbody"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">'+circles+'</div><p style="font-size:12px;color:var(--ts);margin-top:10px">إذا لم تُفعّل حلقة هنا فلن تعتبر ضمن تنبيهات الربط، لكن يمكن إدخال درجات لها عند الحاجة.</p></div></div>'
    +'<div><button class="pb sm" onclick="saveEduAssessmentSettings()"><i class="fas fa-floppy-disk"></i> حفظ إعدادات التقييم التعليمي</button></div>'
    +'</div>';
}
async function loadEduAssessmentSettingsInline(){
  var panel=document.getElementById('stEduAssess');
  try{
    var r=await api('جلب_اعدادات_التقييم_التعليمي',{});
    if(r&&r.نجاح){D.eduAssessSettings=r['إعدادات']||{};}
    if(!D.setCircles||!D.setCircles.length){var c=await api('جلب_الحلق',{});D.setCircles=arr(c.حلق);}
    if(panel)panel.innerHTML=buildEduAssessmentSettingsPanel();
  }catch(e){if(panel)panel.innerHTML='<div class="empty"><h3>تعذر تحميل إعدادات التقييم</h3><p>'+q(e.message||e)+'</p></div>';}
}

async function saveEduAssessmentSettings(){
  var circles=[];document.querySelectorAll('.eduRabtCircle:checked').forEach(function(c){circles.push(c.value);});
  spin(true,'جارٍ حفظ إعدادات التقييم…');
  var r=await api('حفظ_اعدادات_التقييم_التعليمي',{اقل_درجة_الربط:val('eduRabtPass'),اقل_درجة_الاختبار:val('eduTestPass'),عدد_الاختبارات:val('eduTestCount'),حلق_الربط:circles});
  spin(false);
  if(!r||!r.نجاح){Swal.fire({icon:'error',title:'تعذر الحفظ',text:(r&&r.خطأ)||'خطأ غير معروف',confirmButtonColor:'#1a3c5e'});return;}
  D.eduAssessSettings=r['إعدادات']||{};
  Swal.fire({icon:'success',title:'تم حفظ إعدادات التقييم',timer:1600,showConfirmButton:false});
  await reloadSettings();
}

// =====================================================================
// Phase 4F — التقارير الإدارية حسب الفترة والأسابيع
// =====================================================================
function admEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function admNum(v){return Number(v||0).toLocaleString('ar-SA');}
function admPct(v){return '<span class="bp bp-in">'+admEsc(v||0)+'%</span>';}
function pgAdminReports(){
  mc('<div class="stitle"><i class="fas fa-chart-simple"></i> التقارير الإدارية</div>'
    +'<div class="cc"><div class="chdr"><h3>تقرير الفترة النشطة</h3><div class="cacts">'
    +'<select id="admReportCircle" class="fi"><option value="">كل الحلق</option>'+arr(D.circles).map(function(c){return '<option>'+admEsc(c)+'</option>';}).join('')+'</select>'
    +'<button class="ob sm" onclick="loadAdminReports()"><i class="fas fa-rotate"></i> تحديث</button>'
    +'<button class="ob sm" onclick="exportAdminReportCsv()"><i class="fas fa-file-csv"></i> CSV</button>'
    +'</div></div>'
    +'<div class="cbody" id="adminReportSummary"><div class="empty"><div class="spri"></div><h3>جارٍ تحميل التقرير…</h3></div></div>'
    +'<div class="stabs"><button class="stab active" onclick="swST(this,\'admReportCircles\')"><i class="fas fa-mosque"></i> الحلق</button><button class="stab" onclick="swST(this,\'admReportWeeks\')"><i class="fas fa-calendar-week"></i> الأسابيع</button><button class="stab" onclick="swST(this,\'admReportStudents\')"><i class="fas fa-users"></i> الطلاب</button></div>'
    +'<div class="spanel active" id="admReportCircles"><div style="overflow:auto;direction:rtl"><table class="dt" style="direction:rtl;text-align:right"><thead><tr><th>#</th><th>الحلقة</th><th>الطلاب</th><th>أيام التحضير</th><th>الحضور</th><th>التأخر</th><th>الغياب</th><th>نسبة الحضور</th><th>إتمام الحفظ</th><th>إنذارات إدارية</th><th>إنذارات تعليمية</th></tr></thead><tbody id="adminReportCirclesBody"></tbody></table></div></div>'
    +'<div class="spanel" id="admReportWeeks"><div style="overflow:auto;direction:rtl"><table class="dt" style="direction:rtl;text-align:right"><thead><tr><th>الأسبوع</th><th>الفترة</th><th>حضور</th><th>تأخر</th><th>غياب</th><th>غياب بعذر</th><th>أتم</th><th>لم يتم</th><th>نسبة الإتمام</th><th>إنذارات مفتوحة</th></tr></thead><tbody id="adminReportWeeksBody"></tbody></table></div></div>'
    +'<div class="spanel" id="admReportStudents"><div style="overflow:auto;direction:rtl"><table class="dt" style="direction:rtl;text-align:right"><thead><tr><th>#</th><th>الطالب</th><th>الحلقة</th><th>أيام التحضير</th><th>حضور</th><th>تأخر</th><th>غياب</th><th>نسبة الحضور</th><th>نسبة الإتمام</th></tr></thead><tbody id="adminReportStudentsBody"></tbody></table></div></div>'
    +'</div>');
  loadAdminReports();
}
async function loadAdminReports(){
  var c=val('admReportCircle');
  var r=await api('جلب_تقرير_اداري_للفترة',{الحلقة:c});
  D.adminTermReport=r;
  if(!r||!r.نجاح){document.getElementById('adminReportSummary').innerHTML='<div class="empty"><h3>تعذر التحميل</h3><p>'+admEsc((r&&r.خطأ)||'خطأ غير معروف')+'</p></div>';return;}
  var m=r.ملخص||{}, term=r.الفترة||{};
  document.getElementById('adminReportSummary').innerHTML='<div class="pgbar" style="margin-bottom:12px"><span>الفترة: <strong>'+admEsc(term['اسم_الفترة']||'—')+'</strong> · '+admEsc(term['تاريخ_البداية']||'')+' إلى '+admEsc(term['تاريخ_النهاية']||'')+'</span></div>'
    +'<div class="kpi-grid">'
    +kpiCard('عدد الطلاب',m['عدد_الطلاب']||0,'fa-users','')
    +kpiCard('الحلق',m['عدد_الحلق']||0,'fa-mosque','')
    +kpiCard('أيام التحضير',m['أيام_التحضير']||0,'fa-calendar-check','kpi-ok')
    +kpiCard('حضور',m['حضور']||0,'fa-user-check','kpi-ok')
    +kpiCard('تأخر',m['تأخر']||0,'fa-clock','kpi-wa')
    +kpiCard('غياب',m['غياب']||0,'fa-user-xmark','kpi-er')
    +kpiCard('إنذارات إدارية مفتوحة',m['إنذارات_إدارية_مفتوحة']||0,'fa-triangle-exclamation','kpi-er')
    +kpiCard('طلبات تسجيل',m['طلبات_تسجيل']||0,'fa-inbox','')+'</div>';
  document.getElementById('adminReportCirclesBody').innerHTML=arr(r['حلق']).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+admEsc(x['اسم_الحلقة']||'—')+'</strong></td><td>'+admNum(x['عدد_الطلاب'])+'</td><td>'+admNum(x['أيام_التحضير'])+'</td><td><span class="bp bp-ok">'+admNum(x['حضور'])+'</span></td><td><span class="bp bp-wa">'+admNum(x['تأخر'])+'</span></td><td><span class="bp bp-er">'+admNum(x['غياب'])+'</span></td><td>'+admPct(x['نسبة_الحضور'])+'</td><td>'+admPct(x['نسبة_إتمام_الحفظ'])+'</td><td>'+admNum(x['إنذارات_إدارية_مفتوحة'])+'</td><td>'+admNum(x['إنذارات_تعليمية_مفتوحة'])+'</td></tr>';}).join('')||'<tr><td colspan="11" style="text-align:center;padding:18px;color:var(--ts)">لا توجد بيانات</td></tr>';
  document.getElementById('adminReportWeeksBody').innerHTML=arr(r['أسابيع']).map(function(w){return '<tr><td><strong>الأسبوع '+admNum(w['رقم_الأسبوع'])+'</strong></td><td>'+admEsc(w['بداية_الأسبوع']||'')+' - '+admEsc(w['نهاية_الأسبوع']||'')+'</td><td>'+admNum(w['حضور'])+'</td><td>'+admNum(w['تأخر'])+'</td><td>'+admNum(w['غياب'])+'</td><td>'+admNum(w['غياب_بعذر'])+'</td><td>'+admNum(w['أتم_الحفظ'])+'</td><td>'+admNum(w['لم_يتم_الحفظ'])+'</td><td>'+admPct(w['نسبة_إتمام_الحفظ'])+'</td><td>'+admNum(w['إنذارات_إدارية_مفتوحة'])+'</td></tr>';}).join('')||'<tr><td colspan="10" style="text-align:center;padding:18px;color:var(--ts)">لا توجد بيانات</td></tr>';
  document.getElementById('adminReportStudentsBody').innerHTML=arr(r['طلاب']).map(function(s,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+admEsc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+admEsc(s['رقم_الطالب']||'')+'</div></td><td>'+admEsc(s['الحلقة']||'—')+'</td><td>'+admNum(s['أيام_التحضير'])+'</td><td>'+admNum(s['حضور'])+'</td><td>'+admNum(s['تأخر'])+'</td><td>'+admNum(s['غياب'])+'</td><td>'+admPct(s['نسبة_الحضور'])+'</td><td>'+admPct(s['نسبة_إتمام_الحفظ'])+'</td></tr>';}).join('')||'<tr><td colspan="9" style="text-align:center;padding:18px;color:var(--ts)">لا توجد بيانات</td></tr>';
}
function exportAdminReportCsv(){
  var rows=arr((D.adminTermReport||{})['طلاب']);
  if(!rows.length){Swal.fire({icon:'info',title:'لا توجد بيانات للتصدير',confirmButtonColor:'#1a3c5e'});return;}
  var cols=['رقم_الطالب','اسم_الطالب','الحلقة','أيام_التحضير','حضور','تأخر','غياب','غياب_بعذر','أتم_الحفظ','لم_يتم_الحفظ','نسبة_الحضور','نسبة_إتمام_الحفظ'];
  var csv=cols.join(',')+'\n'+rows.map(function(x){return cols.map(function(c){return '"'+String(x[c]==null?'':x[c]).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='admin_term_report_'+Date.now()+'.csv';a.click();
}
