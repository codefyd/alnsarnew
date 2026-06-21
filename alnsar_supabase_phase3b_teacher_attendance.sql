-- =====================================================================
-- بوابة النصار الرسمية - Phase 3B
-- تحضير حضور الطالب اليومي للمعلم/المسمع/المساعد
-- =====================================================================

begin;

-- فهرس مساعد لجلب حضور اليوم بسرعة
create index if not exists idx_attendance_circle_date
on public.attendance_records(circle_name, attendance_date);

create index if not exists idx_attendance_student_date_lookup
on public.attendance_records(student_code, attendance_date);

-- ---------------------------------------------------------------------
-- دالة داخلية: تحديد حلقة المستخدم وصلاحياته
-- ---------------------------------------------------------------------
create or replace function public.teacher_attendance_context(
  p_requested_circle text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_user_circle text;
  v_circle text;
  v_is_super boolean := false;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'message', 'المستخدم غير مسجل الدخول');
  end if;

  select
    up.job_title,
    coalesce(c.circle_name, up.circle_name)
  into v_role, v_user_circle
  from public.user_profiles up
  left join public.circles c on c.id = up.circle_id
  where up.id = v_uid
    and up.is_active = true;

  if v_role is null then
    return jsonb_build_object('ok', false, 'message', 'ملف المستخدم غير موجود أو غير نشط');
  end if;

  v_is_super := public.is_super_admin();
  v_circle := nullif(btrim(coalesce(p_requested_circle, '')), '');
  if v_circle is null then
    v_circle := v_user_circle;
  end if;

  if v_circle is null or btrim(v_circle) = '' then
    return jsonb_build_object('ok', false, 'message', 'لا توجد حلقة مرتبطة بالمستخدم');
  end if;

  -- المعلمون ومساعدوهم لا يخرجون عن حلقتهم إلا إذا كانوا مشرفين بصلاحية attendance
  if not v_is_super
     and v_role in ('معلم','مسمع_تعليمي','مساعد_معلم','مساعد_خارجي')
     and coalesce(v_user_circle, '') <> v_circle then
    return jsonb_build_object('ok', false, 'message', 'ليس لديك صلاحية على هذه الحلقة');
  end if;

  return jsonb_build_object(
    'ok', true,
    'user_id', v_uid,
    'role', v_role,
    'user_circle', v_user_circle,
    'circle', v_circle,
    'is_super_admin', v_is_super,
    'can_view', v_is_super or public.has_page_permission('teacher_attendance','view') or public.has_page_permission('attendance','view'),
    'can_create', v_is_super or public.has_page_permission('teacher_attendance','create') or public.has_page_permission('attendance','create'),
    'can_update', v_is_super or public.has_page_permission('teacher_attendance','update') or public.has_page_permission('attendance','update'),
    'can_delete', v_is_super or public.has_page_permission('teacher_attendance','delete') or public.has_page_permission('attendance','delete')
  );
end;
$$;

-- ---------------------------------------------------------------------
-- جلب تحضير حضور اليوم: الطلاب + الموجود من سجل الحضور
-- ---------------------------------------------------------------------
create or replace function public.get_teacher_attendance_day(
  p_circle_name text default null,
  p_date date default current_date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_circle text;
  v_date date := coalesce(p_date, current_date);
  v_rows jsonb;
  v_summary jsonb;
begin
  v_ctx := public.teacher_attendance_context(p_circle_name);
  if coalesce((v_ctx->>'ok')::boolean, false) = false then
    return jsonb_build_object('نجاح', false, 'خطأ', v_ctx->>'message');
  end if;

  if coalesce((v_ctx->>'can_view')::boolean, false) = false then
    return jsonb_build_object('نجاح', false, 'خطأ', 'لا تملك صلاحية عرض تحضير الحضور');
  end if;

  v_circle := v_ctx->>'circle';

  select coalesce(jsonb_agg(jsonb_build_object(
    'رقم_الطالب', s.student_code,
    'اسم_الطالب', s.full_name,
    'رقم_الهوية', s.national_id,
    'المرحلة_الدراسية', s.stage,
    'الصف_الدراسي', s.grade,
    'الحلقة', s.circle_name,
    'مجموع_الحفظ', s.memorized_parts,
    'حالة_الطالب', s.status_name,
    'نوع_الحضور', coalesce(ar.attendance_type, 'حاضر'),
    'ملاحظة', coalesce(ar.note, ''),
    'مسجل', ar.id is not null,
    'تاريخ_التسجيل', ar.created_at,
    'آخر_تعديل', ar.updated_at
  ) order by s.full_name), '[]'::jsonb)
  into v_rows
  from public.students s
  left join public.attendance_records ar
    on ar.student_id = s.id
   and ar.attendance_date = v_date
  where coalesce(s.circle_name, '') = coalesce(v_circle, '')
    and coalesce(s.status_name, 'منتظم') not in ('منسحب','موقوف');

  select jsonb_build_object(
    'إجمالي', count(*),
    'حاضر', count(*) filter (where coalesce(ar.attendance_type, 'حاضر') = 'حاضر'),
    'غائب', count(*) filter (where ar.attendance_type = 'غائب'),
    'غائب_بعذر', count(*) filter (where ar.attendance_type = 'غائب_بعذر'),
    'تأخر', count(*) filter (where ar.attendance_type = 'تأخر'),
    'مسجل', count(ar.id),
    'غير_مسجل', count(*) - count(ar.id)
  )
  into v_summary
  from public.students s
  left join public.attendance_records ar
    on ar.student_id = s.id
   and ar.attendance_date = v_date
  where coalesce(s.circle_name, '') = coalesce(v_circle, '')
    and coalesce(s.status_name, 'منتظم') not in ('منسحب','موقوف');

  return jsonb_build_object(
    'نجاح', true,
    'الحلقة', v_circle,
    'التاريخ', v_date,
    'طلاب', v_rows,
    'ملخص', coalesce(v_summary, '{}'::jsonb),
    'صلاحيات', jsonb_build_object(
      'can_create', (v_ctx->>'can_create')::boolean,
      'can_update', (v_ctx->>'can_update')::boolean,
      'can_delete', (v_ctx->>'can_delete')::boolean
    )
  );
end;
$$;

-- ---------------------------------------------------------------------
-- حفظ تحضير حضور اليوم دفعة واحدة
-- ---------------------------------------------------------------------
create or replace function public.save_teacher_attendance_day(
  p_circle_name text default null,
  p_date date default current_date,
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_uid uuid := auth.uid();
  v_circle text;
  v_date date := coalesce(p_date, current_date);
  v_item jsonb;
  v_code text;
  v_type text;
  v_note text;
  v_student public.students%rowtype;
  v_exists boolean;
  v_saved integer := 0;
  v_denied integer := 0;
  v_skipped integer := 0;
  v_summary jsonb;
begin
  v_ctx := public.teacher_attendance_context(p_circle_name);
  if coalesce((v_ctx->>'ok')::boolean, false) = false then
    return jsonb_build_object('نجاح', false, 'خطأ', v_ctx->>'message');
  end if;

  v_circle := v_ctx->>'circle';

  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then
    return jsonb_build_object('نجاح', false, 'خطأ', 'قائمة الطلاب غير صحيحة');
  end if;

  for v_item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    v_code := nullif(btrim(coalesce(v_item->>'رقم_الطالب', v_item->>'student_code', '')), '');
    v_type := nullif(btrim(coalesce(v_item->>'نوع_الحضور', v_item->>'نوع_الغياب', v_item->>'attendance_type', 'حاضر')), '');
    v_note := nullif(btrim(coalesce(v_item->>'ملاحظة', v_item->>'note', '')), '');

    if v_code is null then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    -- توحيد المسميات
    if v_type in ('حضور','حاضر') then v_type := 'حاضر'; end if;
    if v_type in ('متأخر','تاخر','تأخر') then v_type := 'تأخر'; end if;
    if v_type in ('غياب بعذر','غائب بعذر','غياب_بعذر') then v_type := 'غائب_بعذر'; end if;
    if v_type in ('غياب','غائب') then v_type := 'غائب'; end if;

    if v_type not in ('حاضر','غائب','غائب_بعذر','تأخر') then
      v_type := 'حاضر';
    end if;

    select *
    into v_student
    from public.students
    where student_code = v_code
      and coalesce(circle_name, '') = coalesce(v_circle, '')
    limit 1;

    if not found then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    select exists(
      select 1
      from public.attendance_records
      where student_id = v_student.id
        and attendance_date = v_date
    ) into v_exists;

    if v_exists and coalesce((v_ctx->>'can_update')::boolean, false) = false then
      v_denied := v_denied + 1;
      continue;
    end if;

    if not v_exists and coalesce((v_ctx->>'can_create')::boolean, false) = false then
      v_denied := v_denied + 1;
      continue;
    end if;

    insert into public.attendance_records(
      student_id,
      student_code,
      student_name,
      circle_id,
      circle_name,
      attendance_date,
      attendance_type,
      note,
      recorded_by
    )
    values (
      v_student.id,
      v_student.student_code,
      v_student.full_name,
      v_student.circle_id,
      v_student.circle_name,
      v_date,
      v_type,
      v_note,
      v_uid
    )
    on conflict (student_id, attendance_date) where student_id is not null do update set
      student_code = excluded.student_code,
      student_name = excluded.student_name,
      circle_id = excluded.circle_id,
      circle_name = excluded.circle_name,
      attendance_type = excluded.attendance_type,
      note = excluded.note,
      recorded_by = excluded.recorded_by,
      updated_at = now();

    v_saved := v_saved + 1;
  end loop;

  v_summary := public.get_teacher_attendance_day(v_circle, v_date)->'ملخص';

  return jsonb_build_object(
    'نجاح', true,
    'رسالة', 'تم حفظ تحضير الحضور',
    'تم_الحفظ', v_saved,
    'مرفوض_للصلاحية', v_denied,
    'متجاوز', v_skipped,
    'ملخص', coalesce(v_summary, '{}'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------
-- تقرير مختصر للحلقة حسب فترة
-- ---------------------------------------------------------------------
create or replace function public.get_circle_attendance_report(
  p_circle_name text default null,
  p_date_from date default current_date - 30,
  p_date_to date default current_date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_circle text;
  v_rows jsonb;
  v_total jsonb;
begin
  v_ctx := public.teacher_attendance_context(p_circle_name);
  if coalesce((v_ctx->>'ok')::boolean, false) = false then
    return jsonb_build_object('نجاح', false, 'خطأ', v_ctx->>'message');
  end if;

  if coalesce((v_ctx->>'can_view')::boolean, false) = false then
    return jsonb_build_object('نجاح', false, 'خطأ', 'لا تملك صلاحية عرض التقرير');
  end if;

  v_circle := v_ctx->>'circle';

  select coalesce(jsonb_agg(jsonb_build_object(
    'رقم_الطالب', s.student_code,
    'اسم_الطالب', s.full_name,
    'الحلقة', s.circle_name,
    'حاضر', coalesce(x.present_count,0),
    'غائب', coalesce(x.absent_count,0),
    'غائب_بعذر', coalesce(x.excused_count,0),
    'تأخر', coalesce(x.late_count,0),
    'الإجمالي', coalesce(x.total_count,0)
  ) order by s.full_name), '[]'::jsonb)
  into v_rows
  from public.students s
  left join lateral (
    select
      count(*) filter (where attendance_type = 'حاضر') as present_count,
      count(*) filter (where attendance_type = 'غائب') as absent_count,
      count(*) filter (where attendance_type = 'غائب_بعذر') as excused_count,
      count(*) filter (where attendance_type = 'تأخر') as late_count,
      count(*) as total_count
    from public.attendance_records ar
    where ar.student_id = s.id
      and ar.attendance_date between coalesce(p_date_from, current_date - 30) and coalesce(p_date_to, current_date)
  ) x on true
  where coalesce(s.circle_name,'') = coalesce(v_circle,'');

  select jsonb_build_object(
    'حاضر', count(*) filter (where attendance_type = 'حاضر'),
    'غائب', count(*) filter (where attendance_type = 'غائب'),
    'غائب_بعذر', count(*) filter (where attendance_type = 'غائب_بعذر'),
    'تأخر', count(*) filter (where attendance_type = 'تأخر'),
    'الإجمالي', count(*)
  )
  into v_total
  from public.attendance_records
  where circle_name = v_circle
    and attendance_date between coalesce(p_date_from, current_date - 30) and coalesce(p_date_to, current_date);

  return jsonb_build_object('نجاح', true, 'الحلقة', v_circle, 'من', p_date_from, 'إلى', p_date_to, 'طلاب', v_rows, 'ملخص', coalesce(v_total,'{}'::jsonb));
end;
$$;

-- ---------------------------------------------------------------------
-- لف app_api الحالي لإضافة إجراءات المرحلة 3B بدون كسر السابق
-- ---------------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.app_api_before_phase3b(text,jsonb)') is null
     and to_regprocedure('public.app_api(text,jsonb)') is not null then
    alter function public.app_api(text, jsonb) rename to app_api_before_phase3b;
  end if;
end $$;

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
  v_old jsonb;
  v_teacher_kpi jsonb;
  v_circle text;
  v_today_summary jsonb;
begin
  if p_action = 'جلب_تحضير_حضور_يومي' then
    return public.get_teacher_attendance_day(
      coalesce(p_data->>'الحلقة', p_data->>'circle_name'),
      coalesce(nullif(p_data->>'التاريخ','')::date, current_date)
    );
  end if;

  if p_action = 'حفظ_تحضير_حضور_يومي' then
    return public.save_teacher_attendance_day(
      coalesce(p_data->>'الحلقة', p_data->>'circle_name'),
      coalesce(nullif(p_data->>'التاريخ','')::date, current_date),
      coalesce(p_data->'طلاب', p_data->'items', '[]'::jsonb)
    );
  end if;

  if p_action = 'جلب_تقرير_حضور_حلقة' then
    return public.get_circle_attendance_report(
      coalesce(p_data->>'الحلقة', p_data->>'circle_name'),
      coalesce(nullif(p_data->>'من','')::date, current_date - 30),
      coalesce(nullif(p_data->>'إلى','')::date, current_date)
    );
  end if;

  -- تعزيز تقرير المعلم بإحصائية حضور اليوم
  if p_action = 'جلب_تقارير_معلم' then
    v_old := public.app_api_before_phase3b(p_action, p_data);
    v_circle := coalesce(p_data->>'الحلقة','');
    v_today_summary := public.get_teacher_attendance_day(v_circle, current_date)->'ملخص';
    return jsonb_set(
      v_old,
      '{تقارير}',
      coalesce(v_old->'تقارير','{}'::jsonb) || jsonb_build_object('حضور_اليوم', coalesce(v_today_summary,'{}'::jsonb)),
      true
    );
  end if;

  return public.app_api_before_phase3b(p_action, p_data);

exception
  when others then
    return jsonb_build_object('نجاح', false, 'خطأ', sqlerrm);
end;
$$;

grant execute on function public.teacher_attendance_context(text) to authenticated;
grant execute on function public.get_teacher_attendance_day(text, date) to authenticated;
grant execute on function public.save_teacher_attendance_day(text, date, jsonb) to authenticated;
grant execute on function public.get_circle_attendance_report(text, date, date) to authenticated;
grant execute on function public.app_api(text, jsonb) to anon, authenticated;

commit;

-- اختبارات من الواجهة بعد تسجيل الدخول:
-- app_api('جلب_تحضير_حضور_يومي', {'الحلقة':'اسم الحلقة','التاريخ':'2026-06-21'})
