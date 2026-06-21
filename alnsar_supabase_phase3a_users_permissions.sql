-- =====================================================================
-- بوابة النصار الرسمية - Phase 3A
-- المستخدمون + الأدوار الجديدة + صلاحيات الصفحات
-- =====================================================================

begin;

-- 1) توسيع أدوار المستخدمين
alter table public.user_profiles drop constraint if exists user_profiles_job_title_chk;

alter table public.user_profiles
add constraint user_profiles_job_title_chk check (
  job_title in (
    'مشرف_النظام',
    'مدير',
    'مشرف_اداري',
    'مشرف_تعليمي',
    'معلم',
    'مسمع_تعليمي',
    'مساعد_معلم',
    'مساعد_خارجي',
    'مسجل',
    'مشاهد'
  )
);

-- 2) صفحات إضافية لمرحلة المعلم والتحضير والحضور
insert into public.app_pages (page_key, page_title, page_group, icon, sort_order, is_active)
values
  ('teacher_attendance', 'تحضير حضور الطالب اليومي', 'بوابة المعلم', 'fa-calendar-check', 17, true),
  ('student_listening', 'التسميع والمتابعة', 'بوابة المعلم', 'fa-headphones', 18, true),
  ('supervision_edu', 'صفحة الإشراف التعليمي', 'الإشراف التعليمي', 'fa-user-graduate', 19, true)
on conflict (page_key) do update set
  page_title = excluded.page_title,
  page_group = excluded.page_group,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

-- 3) جدول قوالب الصلاحيات حسب الدور
create table if not exists public.role_page_defaults (
  job_title text not null,
  page_key text not null references public.app_pages(page_key) on delete cascade,
  can_view boolean default false,
  can_create boolean default false,
  can_update boolean default false,
  can_delete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (job_title, page_key)
);

truncate table public.role_page_defaults;

-- مشرف إداري: إدارة النظام التشغيلية
insert into public.role_page_defaults (job_title, page_key, can_view, can_create, can_update, can_delete)
values
  ('مشرف_اداري','dashboard',true,false,false,false),
  ('مشرف_اداري','students',true,true,true,true),
  ('مشرف_اداري','registration_requests',true,true,true,true),
  ('مشرف_اداري','edit_requests',true,true,true,true),
  ('مشرف_اداري','attendance',true,true,true,true),
  ('مشرف_اداري','educational_warnings',true,true,true,true),
  ('مشرف_اداري','administrative_warnings',true,true,true,true),
  ('مشرف_اداري','circles',true,true,true,true),
  ('مشرف_اداري','users',true,true,true,true),
  ('مشرف_اداري','templates',true,true,true,false),
  ('مشرف_اداري','thresholds',true,true,true,false),
  ('مشرف_اداري','reports',true,false,false,false),
  ('مشرف_اداري','settings',true,false,true,false),

-- مشرف تعليمي
  ('مشرف_تعليمي','dashboard',true,false,false,false),
  ('مشرف_تعليمي','students',true,false,false,false),
  ('مشرف_تعليمي','educational_warnings',true,true,true,false),
  ('مشرف_تعليمي','reports',true,false,false,false),
  ('مشرف_تعليمي','supervision_edu',true,true,true,false),

-- مدير
  ('مدير','dashboard',true,false,false,false),
  ('مدير','students',true,false,false,false),
  ('مدير','attendance',true,false,false,false),
  ('مدير','educational_warnings',true,false,false,false),
  ('مدير','administrative_warnings',true,false,false,false),
  ('مدير','circles',true,false,false,false),
  ('مدير','users',true,false,false,false),
  ('مدير','reports',true,false,false,false),
  ('مدير','supervision_edu',true,false,false,false),

-- معلم
  ('معلم','teacher_students',true,false,true,false),
  ('معلم','teacher_attendance',true,true,true,false),
  ('معلم','teacher_preparation',true,true,true,false),
  ('معلم','student_listening',true,true,true,false),
  ('معلم','reports',true,false,false,false),

-- مسمع تعليمي: تركيز على التسميع والحضور فقط
  ('مسمع_تعليمي','teacher_students',true,false,false,false),
  ('مسمع_تعليمي','teacher_attendance',true,true,true,false),
  ('مسمع_تعليمي','student_listening',true,true,true,false),
  ('مسمع_تعليمي','reports',true,false,false,false),

-- مساعد معلم: يساعد المعلم داخل الحلقة
  ('مساعد_معلم','teacher_students',true,false,true,false),
  ('مساعد_معلم','teacher_attendance',true,true,true,false),
  ('مساعد_معلم','teacher_preparation',true,false,false,false),
  ('مساعد_معلم','student_listening',true,true,true,false),

-- مساعد خارجي: صلاحيات محدودة
  ('مساعد_خارجي','teacher_students',true,false,false,false),
  ('مساعد_خارجي','teacher_attendance',true,true,false,false),
  ('مساعد_خارجي','student_listening',true,true,false,false);

-- مشرف النظام: كل الصفحات
insert into public.role_page_defaults (job_title, page_key, can_view, can_create, can_update, can_delete)
select 'مشرف_النظام', page_key, true, true, true, true
from public.app_pages
where is_active = true
on conflict (job_title, page_key) do update set
  can_view = true,
  can_create = true,
  can_update = true,
  can_delete = true,
  updated_at = now();

-- 4) دالة تطبيق صلاحيات الدور الافتراضية
create or replace function public.apply_default_role_permissions(
  p_user_id uuid,
  p_job_title text,
  p_replace boolean default true
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_replace then
    delete from public.user_page_permissions where user_id = p_user_id;
  end if;

  insert into public.user_page_permissions (
    user_id, page_key, can_view, can_create, can_update, can_delete
  )
  select
    p_user_id,
    page_key,
    can_view,
    can_create,
    can_update,
    can_delete
  from public.role_page_defaults
  where job_title = p_job_title
  on conflict (user_id, page_key) do update set
    can_view = excluded.can_view,
    can_create = excluded.can_create,
    can_update = excluded.can_update,
    can_delete = excluded.can_delete,
    updated_at = now();
end;
$$;

-- طبّق الصلاحيات الافتراضية للمستخدمين الذين لا يملكون صلاحيات
select public.apply_default_role_permissions(up.id, up.job_title, false)
from public.user_profiles up
where not exists (
  select 1 from public.user_page_permissions p where p.user_id = up.id
);

-- 5) ربط مستخدم موجود في Supabase Auth بملف داخل النظام
create or replace function public.upsert_worker_from_auth(
  p_email text,
  p_full_name text,
  p_job_title text,
  p_circle_name text default null,
  p_phone text default null,
  p_is_active boolean default true,
  p_reset_permissions boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user auth.users%rowtype;
  v_circle_id uuid;
begin
  if p_email is null or btrim(p_email) = '' then
    return jsonb_build_object('نجاح', false, 'خطأ', 'البريد مطلوب');
  end if;

  select * into v_auth_user
  from auth.users
  where lower(email) = lower(btrim(p_email))
  limit 1;

  if not found then
    return jsonb_build_object(
      'نجاح', false,
      'خطأ', 'المستخدم غير موجود في Supabase Authentication. أنشئه أولًا من Authentication ثم أعد المحاولة.'
    );
  end if;

  if p_circle_name is not null and btrim(p_circle_name) <> '' then
    insert into public.circles(circle_name, is_active)
    values (btrim(p_circle_name), true)
    on conflict (circle_name) do update set is_active = true, updated_at = now()
    returning id into v_circle_id;
  end if;

  insert into public.user_profiles (
    id, full_name, job_title, circle_id, circle_name, phone, is_active, is_super_admin
  )
  values (
    v_auth_user.id,
    coalesce(nullif(btrim(p_full_name), ''), split_part(v_auth_user.email, '@', 1)),
    coalesce(nullif(btrim(p_job_title), ''), 'مشاهد'),
    v_circle_id,
    nullif(btrim(coalesce(p_circle_name, '')), ''),
    nullif(btrim(coalesce(p_phone, '')), ''),
    coalesce(p_is_active, true),
    case when p_job_title = 'مشرف_النظام' then true else false end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    job_title = excluded.job_title,
    circle_id = excluded.circle_id,
    circle_name = excluded.circle_name,
    phone = excluded.phone,
    is_active = excluded.is_active,
    is_super_admin = case when excluded.job_title = 'مشرف_النظام' then true else user_profiles.is_super_admin end,
    updated_at = now();

  perform public.apply_default_role_permissions(v_auth_user.id, p_job_title, p_reset_permissions);

  return jsonb_build_object('نجاح', true, 'رسالة', 'تم ربط المستخدم وتطبيق صلاحيات الدور', 'معرف', v_auth_user.id);
end;
$$;

-- 6) حفظ صلاحيات مخصصة لمستخدم
create or replace function public.save_worker_permissions(
  p_user_id uuid,
  p_permissions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
begin
  if p_user_id is null then
    return jsonb_build_object('نجاح', false, 'خطأ', 'معرف المستخدم مفقود');
  end if;

  delete from public.user_page_permissions where user_id = p_user_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_permissions, '[]'::jsonb)) loop
    insert into public.user_page_permissions (
      user_id, page_key, can_view, can_create, can_update, can_delete
    ) values (
      p_user_id,
      v_item->>'page_key',
      coalesce((v_item->>'can_view')::boolean, false),
      coalesce((v_item->>'can_create')::boolean, false),
      coalesce((v_item->>'can_update')::boolean, false),
      coalesce((v_item->>'can_delete')::boolean, false)
    )
    on conflict (user_id, page_key) do update set
      can_view = excluded.can_view,
      can_create = excluded.can_create,
      can_update = excluded.can_update,
      can_delete = excluded.can_delete,
      updated_at = now();
  end loop;

  return jsonb_build_object('نجاح', true, 'رسالة', 'تم حفظ الصلاحيات');
end;
$$;

-- 7) نلف app_api الحالي بدون كسر المراحل السابقة
DO $$
BEGIN
  IF to_regprocedure('public.app_api_before_phase3a(text,jsonb)') IS NULL
     AND to_regprocedure('public.app_api(text,jsonb)') IS NOT NULL THEN
    ALTER FUNCTION public.app_api(text, jsonb) RENAME TO app_api_before_phase3a;
  END IF;
END $$;

create or replace function public.app_api(
  p_action text,
  p_data jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
  v_user_id uuid;
  v_circle text;
  v_students_result jsonb;
  v_teacher_kpi jsonb;
  v_role text;
  v_result jsonb;
begin
  -- صفحات النظام
  if p_action = 'جلب_صفحات_النظام' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'page_key', page_key,
      'page_title', page_title,
      'page_group', page_group,
      'icon', icon,
      'sort_order', sort_order
    ) order by sort_order, page_title), '[]'::jsonb)
    into v_rows
    from public.app_pages
    where is_active = true;

    return jsonb_build_object('نجاح', true, 'صفحات', v_rows);
  end if;

  -- قائمة العاملين مع البريد والصلاحيات
  if p_action = 'جلب_العاملين' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'معرف', up.id,
      'البريد', au.email,
      'الاسم', up.full_name,
      'الوظيفة', up.job_title,
      'الحلقة', coalesce(c.circle_name, up.circle_name),
      'رمز_الدخول', up.legacy_login_code,
      'رقم_الجوال', up.phone,
      'تاريخ_الإضافة', up.created_at,
      'نشط', case when up.is_active then 'نعم' else 'لا' end,
      'صلاحيات', coalesce((
        select jsonb_agg(jsonb_build_object(
          'page_key', upp.page_key,
          'can_view', upp.can_view,
          'can_create', upp.can_create,
          'can_update', upp.can_update,
          'can_delete', upp.can_delete
        ) order by upp.page_key)
        from public.user_page_permissions upp
        where upp.user_id = up.id
      ), '[]'::jsonb)
    ) order by up.full_name), '[]'::jsonb)
    into v_rows
    from public.user_profiles up
    left join auth.users au on au.id = up.id
    left join public.circles c on c.id = up.circle_id;

    return jsonb_build_object('نجاح', true, 'عاملون', v_rows);
  end if;

  -- إضافة/ربط عامل موجود في Auth
  if p_action = 'إضافة_عامل' then
    return public.upsert_worker_from_auth(
      p_data->>'البريد',
      p_data->>'الاسم',
      p_data->>'الوظيفة',
      p_data->>'الحلقة',
      p_data->>'رقم_الجوال',
      true,
      true
    );
  end if;

  -- تعديل عامل
  if p_action = 'تعديل_عامل' then
    if nullif(p_data->>'معرف','') is not null then
      v_user_id := (p_data->>'معرف')::uuid;
    elsif nullif(p_data->>'البريد','') is not null then
      select id into v_user_id from auth.users where lower(email)=lower(p_data->>'البريد') limit 1;
    elsif nullif(p_data->>'الاسم_القديم','') is not null then
      select id into v_user_id from public.user_profiles where full_name = p_data->>'الاسم_القديم' limit 1;
    end if;

    if v_user_id is null then
      return jsonb_build_object('نجاح', false, 'خطأ', 'لم يتم العثور على المستخدم');
    end if;

    return public.upsert_worker_from_auth(
      coalesce(p_data->>'البريد', (select email from auth.users where id = v_user_id)),
      p_data->>'الاسم',
      p_data->>'الوظيفة',
      p_data->>'الحلقة',
      p_data->>'رقم_الجوال',
      coalesce(p_data->>'نشط','نعم') = 'نعم',
      true
    );
  end if;

  -- تعطيل عامل
  if p_action = 'حذف_عامل' then
    update public.user_profiles
    set is_active = false, updated_at = now()
    where full_name = p_data->>'الاسم'
       or id::text = p_data->>'معرف';

    return jsonb_build_object('نجاح', true, 'رسالة', 'تم تعطيل المستخدم');
  end if;

  -- حفظ صلاحيات مخصصة
  if p_action = 'حفظ_صلاحيات_عامل' then
    if nullif(p_data->>'معرف','') is not null then
      v_user_id := (p_data->>'معرف')::uuid;
    end if;
    return public.save_worker_permissions(v_user_id, coalesce(p_data->'صلاحيات','[]'::jsonb));
  end if;

  -- تهيئة أدوار المعلم الجديدة بنفس بيانات المعلم إلى أن نكمل Phase 3B
  if p_action = 'جلب_بيانات_التهيئة' then
    v_role := coalesce(p_data->>'الوظيفة','');
    if v_role in ('معلم','مسمع_تعليمي','مساعد_معلم','مساعد_خارجي') then
      v_circle := coalesce(p_data->>'الحلقة','');
      v_students_result := public.app_api_before_phase3a('جلب_طلاب_الحلقة', jsonb_build_object('الحلقة', v_circle));
      v_teacher_kpi := public.app_api_before_phase3a('جلب_تقارير_معلم', jsonb_build_object('الحلقة', v_circle))->'تقارير';
      return jsonb_build_object('نجاح', true, 'طلاب', v_students_result->'طلاب', 'تقارير', v_teacher_kpi);
    end if;

    v_result := public.app_api_before_phase3a(p_action, p_data);
    if v_role in ('مشرف_اداري','مشرف_النظام','مدير') then
      return v_result || jsonb_build_object('صفحات', public.app_api('جلب_صفحات_النظام','{}'::jsonb)->'صفحات');
    end if;
    return v_result;
  end if;

  return public.app_api_before_phase3a(p_action, p_data);

exception
  when others then
    return jsonb_build_object('نجاح', false, 'خطأ', sqlerrm);
end;
$$;

grant select, insert, update, delete on public.role_page_defaults to authenticated;
grant execute on function public.apply_default_role_permissions(uuid, text, boolean) to authenticated;
grant execute on function public.upsert_worker_from_auth(text, text, text, text, text, boolean, boolean) to authenticated;
grant execute on function public.save_worker_permissions(uuid, jsonb) to authenticated;
grant execute on function public.app_api(text, jsonb) to anon, authenticated;

commit;

-- اختبار سريع:
-- select public.app_api('جلب_صفحات_النظام','{}'::jsonb);
-- select public.app_api('جلب_العاملين','{}'::jsonb);
