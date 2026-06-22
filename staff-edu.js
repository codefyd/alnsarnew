// مجمع تحفيظ القرآن الكريم — منظومة الإدارة الرقمية
// يُحمَّل هذا الملف من staff.html

// Helper: رقم الأسبوع الحالي لتقارير الربط
// كان معرفًا في staff-teacher.js فقط، والمشرف التعليمي لا يحمل هذا الملف.
function currentWeekNo(){
  var d = new Date();
  var onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

// Helper: تهريب النصوص لاستخدامها بأمان داخل HTML
function hesc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');}

function pgEduKpi(){
  var t=D.eduKpi;
  mc('<div class="stitle"><i class="fas fa-chart-pie"></i> لوحة المشرف التعليمي</div><div class="kpi-grid">'
    +kpiCard('إجمالي الطلاب',t.إجمالي_الطلاب||0,'fa-users','')
    +kpiCard('عدد الحلق',t.عدد_الحلق||0,'fa-mosque','')
    +kpiCard('مجموع الأجزاء',t.مجموع_الحفظ||0,'fa-book-open','kpi-ac')
    +kpiCard('إنذارات مفتوحة',t.انذارات_تعليمية_مفتوحة||0,'fa-triangle-exclamation','kpi-er')
    +kpiCard('إنذارات مكتملة',t.انذارات_تعليمية_مكتملة||0,'fa-check-circle','kpi-ok')
    +'</div>');
}

function pgEduW(){
  var all=arr(D.eduWarnings);
  var open=all.filter(function(a){return!String(a['تاريخ_الإغلاق']||'');});
  var closed=all.filter(function(a){return String(a['تاريخ_الإغلاق']||'');});
  var copts=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  mc('<div class="stitle"><i class="fas fa-triangle-exclamation"></i> الإنذارات التعليمية (اطلاع)</div>'
    +'<div class="cc"><div class="stabs">'
    +'<button class="stab active" onclick="swST(this,\'ewO\')"><i class="fas fa-folder-open"></i> المفتوحة ('+open.length+')</button>'
    +'<button class="stab" onclick="swST(this,\'ewC\')"><i class="fas fa-check-circle"></i> المغلقة ('+closed.length+')</button>'
    +'</div>'
    +'<div class="spanel active" id="ewO">'
    +'<div style="padding:12px 18px 0"><div class="fb">'
    +'<select class="fi" onchange="filterEW(this.value,\'\')"><option value="">كل الحلق</option>'+copts+'</select>'
    +'<input class="fi" placeholder="بحث باسم…" oninput="filterEW(\'\',this.value)" style="min-width:140px">'
    +'</div></div>'
    +'<div class="cbody" id="ewOBody">'+buildEduWCards(open)+'</div></div>'
    +'<div class="spanel" id="ewC"><div class="cbody">'+buildEduWCards(closed,true)+'</div></div>'
    +'</div>');
  D._ewOpen=open;
}

function buildEduWCards(list,closed){
  if(!list.length)return'<div class="empty"><i class="fas fa-check-circle" style="color:var(--ok)"></i><h3>'+(closed?'لا توجد إنذارات مغلقة':'لا توجد إنذارات مفتوحة')+'</h3></div>';
  return list.map(function(a){
    var st=D.eduStudentMap[a['اسم_الطالب']]||{};
    var sPhone=a['رقم_جوال_الطالب']||st['رقم_الجوال']||'';
    var pPhone=a['رقم_جوال_ولي_الامر']||st['رقم_جوال_ولي_الامر']||'';
    var pName=a['اسم_ولي_الامر']||'';
    var btnS=sPhone?'<button class="wab sm" onclick="sendEduWa(\''+q(sPhone)+'\',\''+q(a['اسم_الطالب'])+'\',\''+q(pName)+'\',\''+q(a['سبب_الانذار']||'')+'\',true)"><i class="fab fa-whatsapp"></i> طالب</button>':'';
    var btnP=pPhone?'<button class="wab sm" onclick="sendEduWa(\''+q(pPhone)+'\',\''+q(a['اسم_الطالب'])+'\',\''+q(pName)+'\',\''+q(a['سبب_الانذار']||'')+'\',false)"><i class="fab fa-whatsapp"></i> ولي الأمر</button>':'';
    var mg='<button class="ob sm" onclick="editEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-pen"></i> تعديل</button>'
      +(closed?'<button class="ob sm" onclick="reopenEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-rotate-left"></i> تراجع</button>':'')
      +'<button class="ob sm" onclick="deleteEduWarning(\''+q(a['رقم_الانذار'])+'\')"><i class="fas fa-trash"></i> حذف</button>';
    return'<div class="wcard" id="ewc_'+q(a['رقم_الانذار'])+'"><div class="wico wi-e"><i class="fas fa-triangle-exclamation"></i></div>'
     +'<div class="wbody"><h4>'+q(a['اسم_الطالب']||'—')+' <span style="font-weight:400;font-size:11px;color:var(--ts)">· '+q(a['الحلقة']||'—')+'</span></h4>'
     +'<p>'+q(a['سبب_الانذار']||'—')+' · '+fmtDate(a['تاريخ_الإصدار'])
     +(closed?' · <strong style="color:var(--ok)">أُغلق '+fmtDate(a['تاريخ_الإغلاق'])+'</strong>':' · الإجراء: <strong>'+q(a['حالة_الإجراء']||'بانتظار الإدارة')+'</strong>')+'</p>'
     +'</div><div class="wacts">'+btnS+btnP+mg+'</div></div>';
  }).join('');
}

function filterEW(c,q2){
  var l=arr(D._ewOpen);
  if(c)l=l.filter(function(a){return a['الحلقة']===c;});
  if(q2)l=l.filter(function(a){return String(a['اسم_الطالب']||'').includes(q2);});
  var e=document.getElementById('ewOBody');if(e)e.innerHTML=buildEduWCards(l);
}

function sendEduWa(phone,sName,pName,reason,isStudent){
  var tpl=(D.templates||[]).find(function(t){return isStudent?t['نوع_القالب']==='انذار_تعليمي_للطالب':t['نوع_القالب']==='انذار_تعليمي_لولي_الامر';});
  var msg=buildMsg(tpl?tpl['نص_القالب']:'',{اسم_الطالب:sName,اسم_ولي_الطالب:pName,السبب:reason,تاريخ:hijri()});
  whatsapp(phone,msg);
}

function pgEduSt(){
  var list=arr(D.eduStudents);
  var copts=D.circles.map(function(h){return'<option>'+h+'</option>';}).join('');
  var rows=list.map(function(ط,i){
    return'<tr data-n="'+q(ط['اسم_الطالب']||'')+'" data-c="'+q(ط['الحلقة']||'')+'">'
     +'<td>'+(i+1)+'</td><td><strong>'+q(ط['اسم_الطالب']||'—')+'</strong></td>'
     +'<td>'+(ط['الحلقة']||'—')+'</td><td>'+(ط['المرحلة_الدراسية']||'—')+'</td>'
     +'<td>'+(ط['مجموع_الحفظ']||0)+' جزء</td>'
     +'<td>'+sBadge(ط['حالة_الطالب'])+'</td>'
     +'<td><button class="ob sm" onclick="issueEduWarn(\''+qj(ط)+'\')"><i class="fas fa-triangle-exclamation"></i> إنذار</button></td>'
     +'</tr>';
  }).join('');
  mc('<div class="stitle"><i class="fas fa-users"></i> الحلق والطلاب — إصدار الإنذارات</div>'
    +'<div class="cc"><div class="chdr"><h3>الطلاب ('+list.length+')</h3>'
    +'<div class="cacts">'
    +'<select class="fi" onchange="filterESt(this.value,\'\')"><option value="">كل الحلق</option>'+copts+'</select>'
    +'<input class="fi" placeholder="بحث باسم…" oninput="filterESt(\'\',this.value)" style="min-width:140px">'
    +'</div></div>'
    +'<div style="overflow-x:auto"><table class="dt" id="eStTbl">'
    +'<thead><tr><th>#</th><th>الاسم</th><th>الحلقة</th><th>المرحلة</th><th>الحفظ</th><th>الحالة</th><th>إنذار</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div></div>');
}

function filterESt(c,q2){document.querySelectorAll('#eStTbl tbody tr').forEach(function(r){r.style.display=(!c||r.dataset.c===c)&&(!q2||r.dataset.n.includes(q2))?'':'none';});}

async function issueEduWarn(sdStr){
  var ط=JSON.parse(decodeURIComponent(sdStr));

  var reasons = arr(D.eduReasons);

  if(!reasons.length){
    var rp=await api('جلب_الاجراءات',{نوع_الاجراء:'سبب_تعليمي'});
    var allReasons=arr(rp.إجراءات);
    D.eduReasons=allReasons
      .filter(function(x){return x['نوع_الاجراء']==='سبب_تعليمي';})
      .map(function(x){return x['اسم_الاجراء'];})
      .filter(Boolean);
    reasons = arr(D.eduReasons);
  }

  if(!reasons.length){
    return Swal.fire({
      icon:'info',
      title:'لا توجد أسباب مضافة',
      text:'أضف أسباب الإنذارات التعليمية أولاً من الإعدادات',
      confirmButtonColor:'#1a3c5e',
      customClass:{popup:'swal-rtl'}
    });
  }

  var opts=reasons.map(function(r){return'<option>'+r+'</option>';}).join('');

  var res=await Swal.fire({
    title:'إصدار إنذار تعليمي',
    html:'<div style="direction:rtl;text-align:right;display:grid;gap:10px">'
     +'<div style="font-size:13px;color:var(--ts)">الطالب: <strong>'+q(ط['اسم_الطالب']||'—')+'</strong> · الحلقة: <strong>'+q(ط['الحلقة']||'—')+'</strong></div>'
     +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">سبب الإنذار</label>'
     +'<select id="ewSel" class="swal2-select" style="font-family:Tajawal;width:100%;margin:0"><option value="">-- اختر --</option>'+opts+'</select></div>'
     +'<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:5px">ملاحظة إضافية (اختياري)</label>'
     +'<textarea id="ewNote" class="swal2-textarea" style="font-family:Tajawal;direction:rtl;height:80px;width:100%;margin:0"></textarea></div>'
     +'</div>',
    showCancelButton:true,
    confirmButtonText:'إصدار',
    cancelButtonText:'إلغاء',
    confirmButtonColor:'#1a3c5e',
    customClass:{popup:'swal-rtl'},
    preConfirm:function(){
      var b=val('ewSel'),n=val('ewNote').trim();
      if(!b) return Swal.showValidationMessage('اختر سبب الإنذار');
      return n ? b+' — '+n : b;
    }
  });

  if(!res.isConfirmed||!res.value) return;

  spin(true,'جارٍ إصدار الإنذار…');
  var r=await api('إصدار_إنذار_تعليمي',{
    اسم_الطالب:ط['اسم_الطالب'],
    رقم_الطالب:ط['رقم_الطالب']||'',
    الحلقة:ط['الحلقة'],
    المرحلة_الدراسية:ط['المرحلة_الدراسية']||'',
    سبب_الانذار:res.value,
    اسم_المشرف:D.user['الاسم'],
    رقم_جوال_الطالب:ط['رقم_الجوال']||''
  });
  spin(false);

  if(r.نجاح){
    Swal.fire({icon:'success',title:'تم إصدار الإنذار',text:r.رقم_الانذار,timer:2000,showConfirmButton:false});
    D.eduWarnings.push({
      رقم_الانذار:r.رقم_الانذار,
      اسم_الطالب:ط['اسم_الطالب'],
      الحلقة:ط['الحلقة'],
      سبب_الانذار:res.value,
      حالة_الإجراء:'بانتظار الإدارة',
      تاريخ_الإصدار:new Date().toISOString(),
      تاريخ_الإغلاق:''
    });
    updateEduBadge();
    saveCache();
  }else{
    Swal.fire({icon:'error',title:'خطأ',text:r.خطأ||'حدث خطأ',confirmButtonColor:'#1a3c5e'});
  }
}


function getEduWarningById(id){return arr(D.eduWarnings).find(function(x){return String(x['رقم_الانذار'])===String(id);})||{};}
function eduReasonOptions(selected){var reasons=arr(D.eduReasons).map(function(x){return typeof x==='string'?x:x['اسم_الاجراء'];}).filter(Boolean);reasons=Array.from(new Set(reasons));return '<option value="">-- اختر --</option>'+reasons.map(function(r){return'<option '+(r===selected?'selected':'')+'>'+q(r)+'</option>';}).join('');}
function eduActionOptions(selected){var acts=arr(D.eduProcs).map(function(x){return typeof x==='string'?x:x['اسم_الاجراء'];}).filter(Boolean);acts=Array.from(new Set(acts));return '<option value="">-- بدون تغيير --</option>'+acts.map(function(r){return'<option '+(r===selected?'selected':'')+'>'+q(r)+'</option>';}).join('');}
async function editEduWarning(id){
  var a=getEduWarningById(id);
  var res=await Swal.fire({title:'تعديل الإنذار التعليمي',width:'620px',html:'<div style="direction:rtl;text-align:right;display:grid;gap:10px">'
    +'<div style="font-size:13px;color:var(--ts)">الطالب: <strong>'+q(a['اسم_الطالب']||'—')+'</strong> · رقم الإنذار: <strong>'+q(id)+'</strong></div>'
    +'<div><label style="font-size:12px;font-weight:700">سبب الإنذار</label><select id="edw_reason" class="swal2-select" style="font-family:Tajawal;width:100%;margin:4px 0 0">'+eduReasonOptions(a['سبب_الانذار'])+'</select></div>'
    +'<div><label style="font-size:12px;font-weight:700">الإجراء</label><select id="edw_action" class="swal2-select" style="font-family:Tajawal;width:100%;margin:4px 0 0">'+eduActionOptions(a['حالة_الإجراء'])+'</select></div>'
    +'<div><label style="font-size:12px;font-weight:700">اسم المشرف</label><input id="edw_sup" class="swal2-input" style="font-family:Tajawal;width:100%;margin:4px 0 0" value="'+q(a['اسم_المشرف']||'')+'"></div>'
    +'<div><label style="font-size:12px;font-weight:700">تاريخ الإصدار</label><input id="edw_date" type="date" class="swal2-input" style="font-family:Tajawal;width:100%;margin:4px 0 0" value="'+String(a['تاريخ_الإصدار']||'').slice(0,10)+'"></div>'
    +'<div><label style="font-size:12px;font-weight:700">ملاحظات</label><textarea id="edw_notes" class="swal2-textarea" style="font-family:Tajawal;direction:rtl;height:90px;width:100%;margin:4px 0 0">'+q(a['ملاحظات']||'')+'</textarea></div></div>',showCancelButton:true,confirmButtonText:'حفظ التعديل',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'},preConfirm:function(){var reason=val('edw_reason');if(!reason)return Swal.showValidationMessage('اختر سبب الإنذار');return {سبب_الانذار:reason,حالة_الإجراء:val('edw_action'),اسم_المشرف:val('edw_sup'),تاريخ_الإصدار:val('edw_date'),ملاحظات:val('edw_notes')};}});
  if(!res.isConfirmed)return;
  spin(true,'جارٍ تعديل الإنذار…');var r=await api('تعديل_انذار_تعليمي',Object.assign({رقم_الانذار:id},res.value));spin(false);
  if(r.نجاح){D.eduWarnings=arr(D.eduWarnings).map(function(x){return String(x['رقم_الانذار'])===String(id)?Object.assign({},x,res.value):x;});Swal.fire({icon:'success',title:'تم التعديل',timer:1400,showConfirmButton:false});pgEduW();}
  else Swal.fire({icon:'error',title:'خطأ',text:r.خطأ||'تعذر تعديل الإنذار',confirmButtonColor:'#1a3c5e'});
}
async function deleteEduWarning(id){var res=await Swal.fire({icon:'warning',title:'حذف الإنذار؟',text:'سيتم حذف الإنذار نهائيًا من السجل.',showCancelButton:true,confirmButtonText:'حذف',cancelButtonText:'إلغاء',confirmButtonColor:'#c0392b',customClass:{popup:'swal-rtl'}});if(!res.isConfirmed)return;spin(true,'جارٍ الحذف…');var r=await api('حذف_انذار_تعليمي',{رقم_الانذار:id});spin(false);if(r.نجاح){D.eduWarnings=arr(D.eduWarnings).filter(function(x){return String(x['رقم_الانذار'])!==String(id);});updateEduBadge();Swal.fire({icon:'success',title:'تم الحذف',timer:1300,showConfirmButton:false});pgEduW();}else Swal.fire({icon:'error',title:'خطأ',text:r.خطأ||'تعذر الحذف',confirmButtonColor:'#1a3c5e'});}
async function reopenEduWarning(id){var res=await Swal.fire({icon:'question',title:'التراجع عن إغلاق الإنذار؟',text:'سيعود الإنذار إلى قائمة المتابعة المفتوحة.',showCancelButton:true,confirmButtonText:'تراجع عن الإغلاق',cancelButtonText:'إلغاء',confirmButtonColor:'#1a3c5e',customClass:{popup:'swal-rtl'}});if(!res.isConfirmed)return;spin(true,'جارٍ إعادة فتح الإنذار…');var r=await api('إعادة_فتح_انذار_تعليمي',{رقم_الانذار:id});spin(false);if(r.نجاح){D.eduWarnings=arr(D.eduWarnings).map(function(x){return String(x['رقم_الانذار'])===String(id)?Object.assign({},x,{'تاريخ_الإغلاق':'','حالة_الإجراء':'بانتظار الإدارة'}):x;});updateEduBadge();Swal.fire({icon:'success',title:'تمت إعادة فتح الإنذار',timer:1400,showConfirmButton:false});pgEduW();}else Swal.fire({icon:'error',title:'خطأ',text:r.خطأ||'تعذر إعادة الفتح',confirmButtonColor:'#1a3c5e'});}

async function pgEduSupervision(){
  mc('<div class="empty" style="padding:50px"><div class="spri" style="margin:0 auto 10px"></div><p>جارٍ تحميل الإشراف التعليمي…</p></div>');
  var r=await api('جلب_الإشراف_التعليمي',{});
  if(!r.نجاح)return mc('<div class="empty"><i class="fas fa-triangle-exclamation"></i><h3>تعذر تحميل الصفحة</h3><p>'+q(r.خطأ||'')+'</p></div>');
  var m=r.ملخص||{},term=r.الفترة||{};
  var حلق=arr(r.الحلق),معلمون=arr(r.المعلمون),warn=arr(r.آخر_الإنذارات);
  mc('<div class="stitle"><i class="fas fa-user-graduate"></i> الإشراف التعليمي</div>'
    +'<div class="cc"><div class="chdr"><h3>الفترة الحالية: '+q(term['اسم_الفترة']||'—')+'</h3></div><div class="cbody"><div class="kpi-grid">'
    +kpiCard('إجمالي الطلاب',m['إجمالي_الطلاب']||0,'fa-users','')
    +kpiCard('عدد الحلق',m['عدد_الحلق']||0,'fa-mosque','')
    +kpiCard('المعلمون والمساعدون',m['عدد_المعلمين']||0,'fa-chalkboard-user','kpi-ac')
    +kpiCard('أيام التحضير',m['أيام_تحضير']||0,'fa-calendar-check','kpi-ok')
    +kpiCard('إنذارات مفتوحة',m['إنذارات_تعليمية_مفتوحة']||0,'fa-triangle-exclamation','kpi-er')
    +kpiCard('إنذارات مغلقة',m['إنذارات_تعليمية_مغلقة']||0,'fa-check-circle','kpi-ok')
    +'</div></div></div>'
    +'<div class="cc"><div class="chdr"><h3>ملخص الحلق</h3></div><div style="overflow-x:auto">'+buildEduCircleSupervisionTable(حلق)+'</div></div>'
    +'<div class="cc"><div class="chdr"><h3>المعلمون والمساعدون</h3></div><div style="overflow-x:auto">'+buildEduTeachersTable(معلمون)+'</div></div>'
    +'<div class="cc"><div class="chdr"><h3>آخر الإنذارات التعليمية</h3></div><div class="cbody">'+buildEduRecentWarnings(warn)+'</div></div>');
}
function buildEduCircleSupervisionTable(list){if(!list.length)return'<div class="empty"><h3>لا توجد بيانات</h3></div>';return'<table class="dt"><thead><tr><th>الحلقة</th><th>المعلم</th><th>الطلاب</th><th>مجموع الحفظ</th><th>متوسط الحفظ</th><th>تحضير</th><th>حضور</th><th>تأخر</th><th>غياب</th><th>أتم الحفظ</th><th>إنذارات مفتوحة</th></tr></thead><tbody>'+list.map(function(x){return'<tr><td><strong>'+q(x['اسم_الحلقة']||'—')+'</strong></td><td>'+q(x['اسم_المعلم_المسجل']||'—')+'</td><td>'+q(x['عدد_الطلاب']||0)+'</td><td>'+q(x['مجموع_الحفظ']||0)+'</td><td>'+q(x['متوسط_الحفظ']||0)+'</td><td>'+q(x['أيام_التحضير']||0)+'</td><td>'+q(x['حضور']||0)+'</td><td>'+q(x['تأخر']||0)+'</td><td>'+q(x['غياب']||0)+'</td><td>'+q(x['أتم_الحفظ']||0)+'</td><td>'+q(x['إنذارات_مفتوحة']||0)+'</td></tr>';}).join('')+'</tbody></table>';}
function buildEduTeachersTable(list){if(!list.length)return'<div class="empty"><h3>لا توجد بيانات</h3></div>';return'<table class="dt"><thead><tr><th>الاسم</th><th>الوظيفة</th><th>الحلقة</th><th>عدد الطلاب</th></tr></thead><tbody>'+list.map(function(x){return'<tr><td><strong>'+q(x['الاسم']||'—')+'</strong></td><td>'+q(roleLabel(x['الوظيفة'])||x['الوظيفة']||'—')+'</td><td>'+q(x['الحلقة']||'—')+'</td><td>'+q(x['عدد_طلاب_الحلقة']||0)+'</td></tr>';}).join('')+'</tbody></table>';}
function buildEduRecentWarnings(list){if(!list.length)return'<div class="empty"><h3>لا توجد إنذارات</h3></div>';return list.map(function(a){return'<div class="wcard"><div class="wico wi-e"><i class="fas fa-triangle-exclamation"></i></div><div class="wbody"><h4>'+q(a['اسم_الطالب']||'—')+' <span style="font-weight:400;font-size:11px;color:var(--ts)">· '+q(a['الحلقة']||'—')+'</span></h4><p>'+q(a['سبب_الانذار']||'—')+' · '+fmtDate(a['تاريخ_الإصدار'])+' · '+q(a['حالة_الإجراء']||'—')+'</p></div></div>';}).join('');}

// =====================================================================
// Phase 4D — تقارير الإشراف التعليمي للربط والاختبارات وعرض الحزب
// =====================================================================
function pctBadge(v){
  if(v===null||v===undefined||v==='') return '<span class="bp bp-gr">—</span>';
  var n=Number(v), cls=n>=80?'bp-ok':(n>=60?'bp-wa':'bp-er');
  return '<span class="bp '+cls+'">'+hesc(v)+'%</span>';
}
async function pgEduAssessmentReport(){
  mc('<div class="stitle"><i class="fas fa-chart-line"></i> تقرير التقييم التعليمي</div>'
    +'<div class="cc"><div class="chdr"><h3>تقرير كامل للحلق والطلاب</h3><div class="cacts"><button class="ob sm" onclick="loadEduAssessmentReport()"><i class="fas fa-rotate"></i> تحديث</button><button class="ob sm" onclick="exportEduAssessmentCSV()"><i class="fas fa-file-csv"></i> CSV</button></div></div>'
    +'<div class="cbody" id="eduAssessSummary"><div class="empty"><div class="spri" style="margin:0 auto 10px"></div><p>جارٍ التحميل…</p></div></div>'
    +'<div class="stabs"><button class="stab active" onclick="swST(this,\'eduAssessCircles\')"><i class="fas fa-mosque"></i> ملخص الحلق</button><button class="stab" onclick="swST(this,\'eduAssessStudents\')"><i class="fas fa-users"></i> تفاصيل الطلاب</button></div>'
    +'<div class="spanel active" id="eduAssessCircles"><div style="overflow:auto"><table class="dt"><thead><tr><th>#</th><th>الحلقة</th><th>عدد الحلقة</th><th>الربط مختبرون</th><th>مجتازون</th><th>راسبون</th><th>نسبة الربط</th><th>اختبارات مختبرون</th><th>مجتازون</th><th>راسبون</th><th>عروض الحزب</th></tr></thead><tbody id="eduAssessCircleBody"></tbody></table></div></div>'
    +'<div class="spanel" id="eduAssessStudents"><div style="overflow:auto"><table class="dt"><thead><tr><th>#</th><th>الطالب</th><th>الحلقة</th><th>الربط</th><th>رسوب الربط</th><th>الاختبارات</th><th>رسوب الاختبارات</th><th>عروض الحزب</th><th>آخر حزب</th></tr></thead><tbody id="eduAssessStudentBody"></tbody></table></div></div>'
    +'</div>');
  loadEduAssessmentReport();
}
async function loadEduAssessmentReport(){
  var r=await api('جلب_تقرير_تعليمي_شامل',{});D.eduAssessReport=r;
  if(!r||!r.نجاح){document.getElementById('eduAssessSummary').innerHTML='<div class="empty"><h3>تعذر التحميل</h3><p>'+hesc((r&&r.خطأ)||'')+'</p></div>';return;}
  var term=r['الفترة']||{}, circles=arr(r['حلق']), students=arr(r['طلاب']);
  var tested=circles.reduce(function(a,x){return a+Number(x['الربط_المختبرون']||0);},0), pass=circles.reduce(function(a,x){return a+Number(x['الربط_المجتازون']||0);},0), fail=circles.reduce(function(a,x){return a+Number(x['الربط_الراسبون']||0);},0);
  document.getElementById('eduAssessSummary').innerHTML='<div class="kpi-grid">'+kpiCard('الفترة',term['اسم_الفترة']||'—','fa-calendar-days','')+kpiCard('المختبرون بالربط',tested,'fa-link','')+kpiCard('المجتازون',pass,'fa-check','kpi-ok')+kpiCard('الراسبون',fail,'fa-xmark','kpi-er')+'</div>';
  document.getElementById('eduAssessCircleBody').innerHTML=circles.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+hesc(x['اسم_الحلقة']||'—')+'</strong></td><td>'+hesc(x['عدد_الطلاب']||0)+'</td><td>'+hesc(x['الربط_المختبرون']||0)+'</td><td><span class="bp bp-ok">'+hesc(x['الربط_المجتازون']||0)+'</span></td><td><span class="bp bp-er">'+hesc(x['الربط_الراسبون']||0)+'</span></td><td>'+pctBadge(x['نسبة_اجتياز_الربط'])+'</td><td>'+hesc(x['الاختبارات_المختبرون']||0)+'</td><td>'+hesc(x['الاختبارات_المجتازون']||0)+'</td><td>'+hesc(x['الاختبارات_الراسبون']||0)+'</td><td>'+hesc(x['عروض_الحزب']||0)+'</td></tr>';}).join('')||'<tr><td colspan="11" style="text-align:center;padding:18px;color:var(--ts)">لا توجد بيانات</td></tr>';
  document.getElementById('eduAssessStudentBody').innerHTML=students.map(function(s,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+hesc(s['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+hesc(s['رقم_الطالب']||'')+'</div></td><td>'+hesc(s['الحلقة']||'—')+'</td><td>'+hesc(s['الربط_عدد']||0)+'</td><td>'+(Number(s['الربط_رسوب']||0)?'<span class="bp bp-er">'+hesc(s['الربط_رسوب'])+'</span>':'<span class="bp bp-ok">0</span>')+'</td><td>'+hesc(s['الاختبارات_عدد']||0)+'</td><td>'+(Number(s['الاختبارات_رسوب']||0)?'<span class="bp bp-er">'+hesc(s['الاختبارات_رسوب'])+'</span>':'<span class="bp bp-ok">0</span>')+'</td><td>'+hesc(s['عروض_الحزب']||0)+'</td><td>'+hesc(s['آخر_حزب']||'—')+'</td></tr>';}).join('')||'<tr><td colspan="9" style="text-align:center;padding:18px;color:var(--ts)">لا توجد بيانات</td></tr>';
}
function exportEduAssessmentCSV(){var rows=arr((D.eduAssessReport||{})['طلاب']);if(!rows.length)return;var cols=['رقم_الطالب','اسم_الطالب','الحلقة','الربط_عدد','الربط_رسوب','الاختبارات_عدد','الاختبارات_رسوب','عروض_الحزب','آخر_حزب'];var csv=cols.join(',')+'\n'+rows.map(function(r){return cols.map(function(c){return '"'+String(r[c]||'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');var b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='edu_assessment_report_'+Date.now()+'.csv';a.click();}

function pgEduRabtWeekReport(){
  var w=D.eduRabtWeek||currentWeekNo();
  mc('<div class="stitle"><i class="fas fa-table-list"></i> تقرير الحلقات الأسبوعي للربط</div>'
    +'<div class="cc"><div class="chdr"><h3>تقرير الأسبوع</h3><div class="cacts"><input id="eduRabtWeek" class="fi" type="number" min="1" max="60" value="'+w+'" style="width:120px"><button class="ob sm" onclick="loadEduRabtWeekReport()"><i class="fas fa-rotate"></i> عرض</button></div></div>'
    +'<div class="cbody" id="rabtWeekSummary"><div class="empty"><div class="spri" style="margin:0 auto 10px"></div><p>جارٍ التحميل…</p></div></div><div style="overflow:auto"><table class="dt"><thead><tr><th>#</th><th>اسم الحلقة</th><th>عدد الحلقة</th><th>المختبرين بالربط</th><th>المجتازين</th><th>الراسبين</th><th>نسبة الاجتياز</th></tr></thead><tbody id="rabtWeekBody"></tbody></table></div></div>');
  loadEduRabtWeekReport();
}
async function loadEduRabtWeekReport(){D.eduRabtWeek=Number(val('eduRabtWeek')||currentWeekNo());var r=await api('جلب_تقرير_الحلقات_اسبوعي_للربط',{الأسبوع:D.eduRabtWeek});D.eduRabtWeekReport=r;if(!r||!r.نجاح){document.getElementById('rabtWeekSummary').innerHTML='<div class="empty"><h3>تعذر التحميل</h3><p>'+hesc((r&&r.خطأ)||'')+'</p></div>';return;}var m=r['ملخص']||{};document.getElementById('rabtWeekSummary').innerHTML='<div class="kpi-grid">'+kpiCard('تقرير الأسبوع',r['الأسبوع']||D.eduRabtWeek,'fa-calendar-week','')+kpiCard('إجمالي المختبرين بالربط',m['إجمالي_المختبرين']||0,'fa-users','')+kpiCard('إجمالي المجتازين',m['إجمالي_المجتازين']||0,'fa-check','kpi-ok')+kpiCard('إجمالي الراسبين',m['إجمالي_الراسبين']||0,'fa-xmark','kpi-er')+kpiCard('متوسط الاجتياز',((m['متوسط_الاجتياز']||0)+'%'),'fa-percent','kpi-ac')+'</div>';document.getElementById('rabtWeekBody').innerHTML=arr(r['حلق']).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+hesc(x['اسم_الحلقة']||'—')+'</strong></td><td>'+hesc(x['عدد_الحلقة']||0)+'</td><td>'+hesc(x['المختبرين_بالربط']||0)+'</td><td><span class="bp bp-ok">'+hesc(x['المجتازين']||0)+'</span></td><td><span class="bp bp-er">'+hesc(x['الراسبين']||0)+'</span></td><td>'+pctBadge(x['نسبة_الاجتياز'])+'</td></tr>';}).join('')||'<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--ts)">لا توجد بيانات</td></tr>';}

function pgEduWeekDetails(){
  var w=D.eduWeekDetails||currentWeekNo();
  mc('<div class="stitle"><i class="fas fa-magnifying-glass-chart"></i> تفاصيل أسابيع الربط</div>'
    +'<div class="cc"><div class="chdr"><h3>تفاصيل الطلاب والراسبين في الربط</h3><div class="cacts"><input id="eduWeekDetails" class="fi" type="number" min="1" max="60" value="'+w+'" style="width:120px"><button class="ob sm" onclick="loadEduWeekDetails()"><i class="fas fa-rotate"></i> عرض</button></div></div>'
    +'<div class="stabs"><button class="stab active" onclick="swST(this,\'weekFailed\')"><i class="fas fa-xmark"></i> الراسبون</button><button class="stab" onclick="swST(this,\'weekAll\')"><i class="fas fa-list"></i> كل التفاصيل</button></div>'
    +'<div class="spanel active" id="weekFailed"><div style="overflow:auto"><table class="dt"><thead><tr><th>#</th><th>الطالب</th><th>الحلقة</th><th>الدرجة</th><th>التاريخ</th></tr></thead><tbody id="weekFailedBody"></tbody></table></div></div>'
    +'<div class="spanel" id="weekAll"><div style="overflow:auto"><table class="dt"><thead><tr><th>#</th><th>الطالب</th><th>الحلقة</th><th>الدرجة</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody id="weekAllBody"></tbody></table></div></div></div>');
  loadEduWeekDetails();
}
async function loadEduWeekDetails(){D.eduWeekDetails=Number(val('eduWeekDetails')||currentWeekNo());var r=await api('جلب_تفاصيل_اسابيع_الربط',{الأسبوع:D.eduWeekDetails});if(!r||!r.نجاح){document.getElementById('weekFailedBody').innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--er);padding:18px">'+hesc((r&&r.خطأ)||'تعذر التحميل')+'</td></tr>';return;}document.getElementById('weekFailedBody').innerHTML=arr(r['الراسبون']).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+hesc(x['اسم_الطالب']||'—')+'</strong><div style="font-size:11px;color:var(--ts)">'+hesc(x['رقم_الطالب']||'')+'</div></td><td>'+hesc(x['الحلقة']||'—')+'</td><td>'+scoreBadge(x['الدرجة'],false)+'</td><td>'+hesc(String(x['تاريخ_العرض']||'').slice(0,10))+'</td></tr>';}).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--ts);padding:18px">لا يوجد راسبون في هذا الأسبوع</td></tr>';document.getElementById('weekAllBody').innerHTML=arr(r['تفاصيل']).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+hesc(x['اسم_الطالب']||'—')+'</strong></td><td>'+hesc(x['الحلقة']||'—')+'</td><td>'+hesc(x['الدرجة']||'')+'</td><td>'+(x['مجتاز']?'<span class="bp bp-ok">مجتاز</span>':'<span class="bp bp-er">راسب</span>')+'</td><td>'+hesc(String(x['تاريخ_العرض']||'').slice(0,10))+'</td></tr>';}).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--ts);padding:18px">لا توجد تفاصيل</td></tr>';}
