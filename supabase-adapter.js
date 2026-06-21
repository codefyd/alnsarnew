// =====================================================================
// بوابة النصار الرسمية - Supabase Adapter
// يربط الواجهة القديمة بـ Supabase بدون تغيير أسماء إجراءات Google Apps Script
// =====================================================================
(function () {
  'use strict';

  const SUPABASE_URL = 'https://hfwyazmvdytydwpcsncg.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pxzmmMsLzlSC3XAnJzPOMw_D9WJ4z-k';
  const OLD_GAS_MARKER = 'script.google.com/macros/s/';

  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase JS library is not loaded. Add @supabase/supabase-js before supabase-adapter.js');
    return;
  }

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  window.alnsarSupabase = sb;

  async function callSupabaseAction(action, data) {
    const { data: result, error } = await sb.rpc('app_api', {
      p_action: action,
      p_data: data || {},
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return { نجاح: false, خطأ: error.message || 'خطأ في الاتصال بقاعدة البيانات' };
    }

    return result || { نجاح: true };
  }

  window.callSupabaseAction = callSupabaseAction;

  // اعتراض أي استدعاء قديم إلى Google Apps Script وتحويله إلى Supabase RPC
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    try {
      const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
      if (url && url.includes(OLD_GAS_MARKER)) {
        let payload = {};
        try {
          payload = JSON.parse((init && init.body) || '{}');
        } catch (e) {
          payload = {};
        }

        const json = await callSupabaseAction(payload.action, payload.data || {});
        return new Response(JSON.stringify(json), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ نجاح: false, خطأ: e.message }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    return originalFetch(input, init);
  };

  // إذا كانت الصفحة فيها دالة api قديمة، نعرّف بديلًا مباشرًا كذلك.
  window.api = async function (action, data) {
    return callSupabaseAction(action, data || {});
  };

  function normalizeRoleForOldUI(role) {
    // واجهة staff.html القديمة لا تعرف مشرف_النظام؛ نعرضه كمشرف إداري مع صلاحيات كاملة من Supabase.
    if (role === 'مشرف_النظام') return 'مشرف_اداري';
    return role || 'مشاهد';
  }

  function isTeacherLike(role) {
    return ['معلم','مسمع_تعليمي','مساعد_معلم','مساعد_خارجي'].indexOf(role) >= 0;
  }

  function profileToLegacyUser(profile) {
    const uiRole = normalizeRoleForOldUI(profile.job_title);
    return {
      id: profile.id,
      'الاسم': profile.full_name || '—',
      'الوظيفة': uiRole,
      'الحلقة': profile.circle_name || '',
      'رقم_الجوال': profile.phone || '',
      is_super_admin: !!profile.is_super_admin,
      permissions: profile.permissions || [],
    };
  }

  function enhanceStaffLoginUI() {
    const loginInput = document.getElementById('loginCode');
    const loginBtn = document.getElementById('loginBtn');
    const loginCard = document.querySelector('.lcard');
    if (!loginInput || !loginBtn || !loginCard) return;

    const title = loginCard.querySelector('h2');
    const sub = loginCard.querySelector('p');
    if (title) title.textContent = 'تسجيل دخول العاملين';
    if (sub) sub.textContent = 'ادخل البريد وكلمة المرور المسجلة في Supabase Auth';

    loginInput.type = 'email';
    loginInput.id = 'loginEmail';
    loginInput.placeholder = 'البريد الإلكتروني';
    loginInput.autocomplete = 'email';
    loginInput.style.letterSpacing = '0';
    loginInput.style.direction = 'ltr';
    loginInput.style.fontSize = '15px';

    if (!document.getElementById('loginPassword')) {
      const pass = document.createElement('input');
      pass.id = 'loginPassword';
      pass.type = 'password';
      pass.placeholder = 'كلمة المرور';
      pass.autocomplete = 'current-password';
      pass.className = loginInput.className || 'linput';
      pass.style.letterSpacing = '0';
      pass.style.direction = 'ltr';
      pass.style.fontSize = '15px';
      loginInput.insertAdjacentElement('afterend', pass);
      pass.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') window.doLogin();
      });
    }

    loginInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const pass = document.getElementById('loginPassword');
        if (pass) pass.focus();
      }
    });

    loginBtn.innerHTML = '<i class="fas fa-right-to-bracket"></i> دخول';
  }

  async function bootStaffFromSession() {
    const loginScreen = document.getElementById('loginScreen');
    const appHeader = document.getElementById('appHeader');
    const appScreen = document.getElementById('appScreen');
    if (!loginScreen || !appHeader || !appScreen || !window.D) return;

    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData || !sessionData.session) return;

    await completeStaffLogin();
  }

  async function completeStaffLogin() {
    const profile = await callSupabaseAction('جلب_ملفي', {});
    if (!profile || !profile.id) {
      throw new Error('لم يتم العثور على ملف المستخدم أو أن الحساب غير نشط');
    }

    window.D.user = profileToLegacyUser(profile);
    window.D.role = window.D.user['الوظيفة'];

    const loginScreen = document.getElementById('loginScreen');
    const appHeader = document.getElementById('appHeader');
    const appScreen = document.getElementById('appScreen');
    const hName = document.getElementById('hName');
    const hRole = document.getElementById('hRole');

    if (loginScreen) loginScreen.style.display = 'none';
    if (appHeader) appHeader.style.display = 'block';
    if (appScreen) appScreen.style.display = 'block';
    if (hName) hName.textContent = window.D.user['الاسم'] || '—';
    if (hRole) hRole.textContent = typeof window.roleLabel === 'function' ? window.roleLabel(window.D.role) : window.D.role;

    if (typeof window.buildSidebar === 'function') window.buildSidebar();
    if (typeof window.spin === 'function') window.spin(true, 'جارٍ تجهيز البيانات…');

    const init = await callSupabaseAction('جلب_بيانات_التهيئة', {
      الوظيفة: window.D.role,
      الحلقة: window.D.user['الحلقة'] || '',
    });

    if (typeof window.spin === 'function') window.spin(false);
    if (!init || !init.نجاح) throw new Error((init && init.خطأ) || 'فشل تحميل التهيئة');

    if (isTeacherLike(window.D.role)) {
      window.D.teacherStudents = init.طلاب || [];
      window.D.teacherKpi = init.تقارير || {};
    } else if (window.D.role === 'مشرف_تعليمي') {
      window.D.eduKpi = init.تقارير || {};
      window.D.eduWarnings = init.انذارات_تعليمية || [];
      window.D.eduStudents = init.طلاب || [];
      window.D.eduStudentMap = {};
      window.D.eduStudents.forEach(function (s) { window.D.eduStudentMap[s['اسم_الطالب']] = s; });
      window.D.circles = init.حلق || [];
      window.D.eduReasons = init.أسباب_تعليمية || [];
      window.D.eduProcs = init.اجراءات_تعليمية || [];
    } else if (window.D.role === 'مشرف_اداري') {
      window.D.students = init.طلاب || [];
      window.D.studentsTotal = init.طلاب_مجموع || 0;
      window.D.studentsPages = init.طلاب_صفحات || 1;
      window.D.circles = init.حلق || [];
      window.D.statuses = init.حالات || [];
      window.D.reqNew = init.طلبات_جديدة || [];
      window.D.reqWait = init.طلبات_انتظار || [];
      window.D.reqEdits = init.طلبات_تعديل || [];
      window.D.adminEduW = init.انذارات_تعليمية || [];
      window.D.adminAdmW = init.انذارات_ادارية_ارشيف || [];
      window.D.templates = init.قوالب || [];
      window.D.thresholds = init.عتبات || [];
      window.D.procedures = init.اجراءات || [];
      window.D.eduReasons = init.أسباب_تعليمية || [];
      window.D.setUsers = init.عاملون || [];
      window.D.appPages = init.صفحات || [];
      window.D.kpi = init.kpi || {};
    } else if (window.D.role === 'مدير') {
      window.D.dirData = {
        admin: init.admin_kpi || {},
        edu: init.edu_kpi || {},
        circles: init.حلق || [],
        users: init.عاملون || [],
      };
    }

    if (typeof window.loadRoleScript === 'function') {
      window.loadRoleScript(window.D.role, function () {
        if (typeof window.navFirst === 'function') window.navFirst();
        if (typeof window.updateReqBadge === 'function') window.updateReqBadge();
        if (typeof window.updateEduBadge === 'function') window.updateEduBadge();
      });
    }
  }

  // تجاوز تسجيل الدخول القديم في staff.html: بدل رمز الدخول نستخدم Supabase Auth
  window.doLogin = async function () {
    const email = (document.getElementById('loginEmail') || document.getElementById('loginCode') || {}).value || '';
    const password = (document.getElementById('loginPassword') || {}).value || '';
    const btn = document.getElementById('loginBtn');
    const err = document.getElementById('loginErr');

    if (!email.trim() || !password.trim()) {
      if (err) {
        err.textContent = 'أدخل البريد وكلمة المرور';
        err.style.display = 'block';
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spin-sm"></span> جارٍ الدخول…';
    }

    try {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      await completeStaffLogin();
    } catch (e) {
      if (typeof window.spin === 'function') window.spin(false);
      if (err) {
        err.textContent = 'تعذر تسجيل الدخول: ' + (e.message || 'بيانات الدخول غير صحيحة');
        err.style.display = 'block';
        setTimeout(function () { err.style.display = 'none'; }, 5000);
      } else {
        alert('تعذر تسجيل الدخول: ' + e.message);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> دخول';
      }
    }
  };

  window.doLogout = async function () {
    try { await sb.auth.signOut(); } catch (e) {}
    try { localStorage.removeItem('alnsar_staff_token'); } catch (e) {}
    window.location.href = 'index.html';
  };

  document.addEventListener('DOMContentLoaded', function () {
    enhanceStaffLoginUI();
    bootStaffFromSession().catch(function (e) {
      console.warn('Supabase session boot skipped:', e.message);
    });
  });
})();
