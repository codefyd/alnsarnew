-- =====================================================================
-- بوابة النصار الرسمية - Supabase V3 API Compatibility Layer
-- الهدف: جعل الواجهة القديمة تستدعي Supabase بنفس أسماء إجراءات Google Apps Script
-- شغّل هذا السكربت بعد V2 وبعد إنشاء أول مستخدم وصلاحياته.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1) تحويل صف الطالب إلى نفس شكل كائنات Google Apps Script القديمة
-- ---------------------------------------------------------------------
create or replace function public.student_ar_json(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object(
      'رقم_الطالب', s.student_code,
      'اسم_الطالب', s.full_name,
      'رقم_الهوية', s.national_id,
      'رقم_الجوال', s.mobile,
      'تاريخ_الميلاد', s.birth_date,
      'الحي_العنوان', s.address,
      'المرحلة_الدراسية', s.stage,
      'الصف_الدراسي', s.grade,
      'الحلقة', coalesce(c.circle_name, s.circle_name),
      'مجموع_الحفظ', coalesce(s.memorized_parts, 0),
      'حالة_الطالب', s.status_name,
      'تاريخ_التسجيل', s.registration_date,
      'ملاحظات', s.notes,
      'اسم_ولي_الامر', g.guardian_name,
      'رقم_جوال_ولي_الامر', g.guardian_phone,
      'رقم_هوية_ولي_الامر', g.guardian_national_id,
      'صلة_ولي_الامر', g.relation
    )
    from public.students s
    left join public.circles c on c.id = s.circle_id
    left join lateral (
      select *
      from public.guardians gg
      where gg.student_id = s.id or gg.student_code = s.student_code
      order by gg.is_primary desc, gg.created_at asc
      limit 1
    ) g on true
    where s.id = p_student_id
  ), '{}'::jsonb);
$$;

-- ---------------------------------------------------------------------
-- 2) رقم طالب جديد من نوع STU-1001 وما بعدها
-- ---------------------------------------------------------------------
create or replace function public.next_student_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select 'STU-' || greatest(
    1001,
    coalesce(max(nullif(regexp_replace(student_code, '\\D', '', 'g'), '')::int) + 1, 1001)
  )::text
  from public.students;
$$;

-- ---------------------------------------------------------------------
-- 3) تطبيق تعديل عربي على جدول الطلاب
-- ---------------------------------------------------------------------
create or replace function public.apply_student_ar_updates(
  p_student_id uuid,
  p_updates jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_circle_name text;
  v_circle_id uuid;
begin
  if p_updates is null or p_updates = '{}'::jsonb then
    return;
  end if;

  if p_updates ? 'الحلقة' then
    v_circle_name := nullif(btrim(p_updates->>'الحلقة'), '');
    select id into v_circle_id from public.circles where circle_name = v_circle_name limit 1;
  end if;

  update public.students s
  set
    full_name = coalesce(nullif(p_updates->>'اسم_الطالب',''), s.full_name),
    national_id = coalesce(nullif(p_updates->>'رقم_الهوية',''), s.national_id),
    mobile = coalesce(nullif(p_updates->>'رقم_الجوال',''), s.mobile),
    birth_date = coalesce(nullif(p_updates->>'تاريخ_الميلاد','')::date, s.birth_date),
    address = coalesce(nullif(p_updates->>'الحي_العنوان',''), s.address),
    stage = coalesce(nullif(p_updates->>'المرحلة_الدراسية',''), s.stage),
    grade = coalesce(nullif(p_updates->>'الصف_الدراسي',''), s.grade),
    circle_name = case when p_updates ? 'الحلقة' then v_circle_name else s.circle_name end,
    circle_id = case when p_updates ? 'الحلقة' then v_circle_id else s.circle_id end,
    memorized_parts = coalesce(nullif(p_updates->>'مجموع_الحفظ','')::numeric, s.memorized_parts),
    status_name = coalesce(nullif(p_updates->>'حالة_الطالب',''), s.status_name),
    notes = coalesce(nullif(p_updates->>'ملاحظات',''), s.notes),
    updated_at = now()
  where s.id = p_student_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 4) API توافقي موحد
-- ---------------------------------------------------------------------
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
  v_uid uuid := auth.uid();
  v_search text;
  v_page int;
  v_limit int;
  v_offset int;
  v_total int;
  v_rows jsonb;
  v_row record;
  v_student record;
  v_request record;
  v_student_id uuid;
  v_student_code text;
  v_circle_id uuid;
  v_circle_name text;
  v_status text;
  v_field text;
  v_new text;
  v_old text;
  v_updates jsonb;
  v_guardian_updates jsonb;
  v_ids jsonb;
  v_id_text text;
  v_csv text;
begin
  p_data := coalesce(p_data, '{}'::jsonb);

  -- ===============================================================
  -- الإجراءات العامة: لا تحتاج تسجيل دخول
  -- ===============================================================
  if p_action = 'تسجيل_طالب_جديد' then
    return (
      select jsonb_build_object(
        'نجاح', coalesce(r->>'ok','false')::boolean,
        'رسالة', r->>'message',
        'رقم_الطلب', r->>'request_no'
      )
      from public.public_submit_registration(
        p_data->>'اسم_الطالب',
        p_data->>'رقم_الهوية',
        p_data->>'رقم_جوال_الطالب',
        nullif(p_data->>'تاريخ_الميلاد','')::date,
        p_data->>'الحي_العنوان',
        p_data->>'المرحلة_الدراسية',
        p_data->>'الصف_الدراسي',
        p_data->>'اسم_ولي_الامر',
        p_data->>'رقم_جوال_ولي_الامر',
        p_data->>'رقم_هوية_ولي_الامر',
        p_data->>'صلة_ولي_الامر'
      ) r
    );
  end if;

  if p_action = 'بحث_عن_طالب' or p_action = 'جلب_بيانات_طالب' then
    v_search := nullif(btrim(coalesce(p_data->>'بحث', p_data->>'رقم_الطالب', '')), '');

    select * into v_student
    from public.students s
    where s.student_code = v_search
       or s.national_id = v_search
       or regexp_replace(coalesce(s.mobile,''),'\\D','','g') = regexp_replace(coalesce(v_search,''),'\\D','','g')
    limit 1;

    if not found then
      return jsonb_build_object('نجاح', false, 'طالب', null, 'خطأ', 'لم يتم العثور على الطالب');
    end if;

    return jsonb_build_object('نجاح', true, 'طالب', public.student_ar_json(v_student.id));
  end if;

  if p_action = 'طلب_تعديل_بيانات' then
    v_student_code := p_data->>'رقم_الطالب';
    v_field := p_data->>'الحقل';
    v_old := p_data->>'القيمة_القديمة';
    v_new := p_data->>'القيمة_الجديدة';

    return public.public_submit_edit_request(v_student_code, v_field, v_old, v_new)
      || jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'جلب_طلبات_التسجيل' and v_uid is null then
    v_search := coalesce(p_data->>'بحث','');
    select coalesce(jsonb_agg(jsonb_build_object(
      'رقم_الطلب', request_no,
      'اسم_الطالب', student_name,
      'رقم_هوية_الطالب', student_national_id,
      'رقم_جوال_الطالب', student_mobile,
      'تاريخ_الميلاد', birth_date,
      'الحي_العنوان', address,
      'المرحلة_الدراسية', stage,
      'الصف_الدراسي', grade,
      'اسم_ولي_الامر', guardian_name,
      'رقم_جوال_ولي_الامر', guardian_phone,
      'رقم_هوية_ولي_الامر', guardian_national_id,
      'صلة_ولي_الامر', guardian_relation,
      'حالة_الطلب', case request_status when 'في_الانتظار' then 'انتظار' else request_status end,
      'سبب_الرفض', rejection_reason,
      'الحلقة_المسكنة', assigned_circle_name,
      'تاريخ_الطلب', requested_at,
      'تاريخ_المعالجة', processed_at
    ) order by requested_at desc), '[]'::jsonb)
    into v_rows
    from public.registration_requests
    where request_status in ('جديد','قيد_المراجعة','في_الانتظار','مرفوض');
    return jsonb_build_object('نجاح', true, 'طلبات', v_rows);
  end if;

  -- ===============================================================
  -- من هنا: إجراءات العاملين تحتاج تسجيل دخول
  -- ===============================================================
  if v_uid is null then
    return jsonb_build_object('نجاح', false, 'خطأ', 'يلزم تسجيل الدخول');
  end if;

  -- ملف المستخدم الحالي
  if p_action = 'جلب_ملفي' then
    return public.get_my_profile();
  end if;

  -- الحلق
  if p_action = 'جلب_الحلق' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'اسم_الحلقة', circle_name,
      'المعلم', teacher_name,
      'المرحلة', stage,
      'عدد_الطلاب', students_count,
      'ملاحظات', notes
    ) order by circle_name), '[]'::jsonb)
    into v_rows
    from public.circles
    where is_active = true;

    return jsonb_build_object('نجاح', true, 'حلق', v_rows);
  end if;

  if p_action = 'إضافة_حلقة' then
    insert into public.circles(circle_name, teacher_name, stage)
    values (p_data->>'اسم_الحلقة', p_data->>'المعلم', p_data->>'المرحلة')
    on conflict (circle_name) do update set
      teacher_name = excluded.teacher_name,
      stage = excluded.stage,
      is_active = true,
      updated_at = now();
    return jsonb_build_object('نجاح', true, 'رسالة', 'تم حفظ الحلقة');
  end if;

  if p_action = 'حذف_حلقة' then
    update public.circles set is_active = false, updated_at = now()
    where circle_name = p_data->>'اسم_الحلقة';
    return jsonb_build_object('نجاح', true, 'رسالة', 'تم تعطيل الحلقة');
  end if;

  -- حالات الطالب
  if p_action = 'جلب_حالات_الطالب' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'اسم_الحالة', status_name,
      'اللون', color,
      'الترتيب', sort_order
    ) order by sort_order, status_name), '[]'::jsonb)
    into v_rows
    from public.student_statuses
    where is_active = true;

    return jsonb_build_object('نجاح', true, 'حالات', v_rows);
  end if;

  if p_action = 'إضافة_حالة_طالب' then
    insert into public.student_statuses(status_name, color, sort_order, is_active)
    values (p_data->>'اسم_الحالة', coalesce(p_data->>'اللون','#1e7e4a'), 99, true)
    on conflict (status_name) do update set color = excluded.color, is_active = true, updated_at = now();
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'حذف_حالة_طالب' then
    update public.student_statuses set is_active = false, updated_at = now()
    where status_name = p_data->>'اسم_الحالة';
    return jsonb_build_object('نجاح', true);
  end if;

  -- الطلاب مع فلاتر وصفحات
  if p_action = 'جلب_الطلاب' then
    v_search := btrim(coalesce(p_data->>'بحث',''));
    v_page := greatest(coalesce(nullif(p_data->>'الصفحة','')::int, 1), 1);
    v_limit := least(greatest(coalesce(nullif(p_data->>'حجم_الصفحة','')::int, 50), 1), 1000);
    v_offset := (v_page - 1) * v_limit;

    with filtered as (
      select s.id
      from public.students s
      where (v_search = '' or s.full_name ilike '%' || v_search || '%' or s.student_code ilike '%' || v_search || '%' or coalesce(s.national_id,'') ilike '%' || v_search || '%')
        and (coalesce(p_data->>'الحلقة','') = '' or coalesce(s.circle_name,'') = p_data->>'الحلقة')
        and (coalesce(p_data->>'حالة_الطالب','') = '' or coalesce(s.status_name,'') = p_data->>'حالة_الطالب')
        and (coalesce(p_data->>'حفظ_اكثر_من','') = '' or coalesce(s.memorized_parts,0) > (p_data->>'حفظ_اكثر_من')::numeric)
        and (coalesce(p_data->>'حفظ_اقل_من','') = '' or coalesce(s.memorized_parts,0) < (p_data->>'حفظ_اقل_من')::numeric)
    ), paged as (
      select id from filtered order by id limit v_limit offset v_offset
    )
    select
      (select count(*) from filtered),
      coalesce(jsonb_agg(public.student_ar_json(paged.id)), '[]'::jsonb)
    into v_total, v_rows
    from paged;

    return jsonb_build_object(
      'نجاح', true,
      'طلاب', coalesce(v_rows,'[]'::jsonb),
      'المجموع', coalesce(v_total,0),
      'عدد_الصفحات', greatest(ceil(coalesce(v_total,0)::numeric / v_limit)::int, 1)
    );
  end if;

  if p_action = 'جلب_طلاب_الحلقة' then
    v_circle_name := p_data->>'الحلقة';
    select coalesce(jsonb_agg(public.student_ar_json(s.id) order by s.full_name), '[]'::jsonb)
    into v_rows
    from public.students s
    where coalesce(s.circle_name,'') = coalesce(v_circle_name,'');
    return jsonb_build_object('نجاح', true, 'طلاب', v_rows);
  end if;

  if p_action = 'تعديل_بيانات_طالب' then
    select * into v_student from public.students where student_code = p_data->>'رقم_الطالب' limit 1;
    if not found then return jsonb_build_object('نجاح', false, 'خطأ', 'الطالب غير موجود'); end if;

    perform public.apply_student_ar_updates(v_student.id, coalesce(p_data->'تعديلات','{}'::jsonb));

    v_guardian_updates := coalesce(p_data->'تعديلات_ولي_الامر','{}'::jsonb);
    if v_guardian_updates <> '{}'::jsonb then
      insert into public.guardians(student_id, student_code, guardian_phone, guardian_name, guardian_national_id, relation)
      values (
        v_student.id,
        v_student.student_code,
        v_guardian_updates->>'رقم_جوال_ولي_الامر',
        v_guardian_updates->>'اسم_ولي_الامر',
        v_guardian_updates->>'رقم_هوية_ولي_الامر',
        v_guardian_updates->>'صلة_ولي_الامر'
      )
      on conflict do nothing;

      update public.guardians g
      set
        guardian_name = coalesce(nullif(v_guardian_updates->>'اسم_ولي_الامر',''), g.guardian_name),
        guardian_phone = coalesce(nullif(v_guardian_updates->>'رقم_جوال_ولي_الامر',''), g.guardian_phone),
        guardian_national_id = coalesce(nullif(v_guardian_updates->>'رقم_هوية_ولي_الامر',''), g.guardian_national_id),
        relation = coalesce(nullif(v_guardian_updates->>'صلة_ولي_الامر',''), g.relation),
        updated_at = now()
      where g.student_id = v_student.id;
    end if;

    return jsonb_build_object('نجاح', true, 'رسالة', 'تم تحديث بيانات الطالب');
  end if;

  if p_action = 'تعديل_جماعي_طلاب' then
    v_updates := coalesce(p_data->'تعديلات','{}'::jsonb);
    for v_id_text in select jsonb_array_elements_text(coalesce(p_data->'أرقام_الطلاب','[]'::jsonb)) loop
      select id into v_student_id from public.students where student_code = v_id_text limit 1;
      if v_student_id is not null then
        perform public.apply_student_ar_updates(v_student_id, v_updates);
      end if;
    end loop;
    return jsonb_build_object('نجاح', true, 'رسالة', 'تم تطبيق التعديل الجماعي');
  end if;

  if p_action = 'حفظ_ملاحظة_معلم' then
    update public.students set notes = p_data->>'ملاحظة', updated_at = now()
    where student_code = p_data->>'رقم_الطالب';
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'تصدير_الطلاب_csv' then
    select 'رقم_الطالب,اسم_الطالب,رقم_الهوية,رقم_الجوال,المرحلة_الدراسية,الصف_الدراسي,الحلقة,مجموع_الحفظ,حالة_الطالب' || chr(10) ||
      coalesce(string_agg(
        concat_ws(',',
          s.student_code,
          replace(coalesce(s.full_name,''), ',', ' '),
          coalesce(s.national_id,''),
          coalesce(s.mobile,''),
          coalesce(s.stage,''),
          coalesce(s.grade,''),
          coalesce(s.circle_name,''),
          coalesce(s.memorized_parts,0),
          coalesce(s.status_name,'')
        ), chr(10)
      ), '')
    into v_csv
    from public.students s;
    return jsonb_build_object('نجاح', true, 'csv', v_csv);
  end if;

  -- طلبات التسجيل
  if p_action = 'جلب_طلبات_التسجيل' then
    v_status := p_data->>'حالة';
    select coalesce(jsonb_agg(jsonb_build_object(
      'رقم_الطلب', request_no,
      'اسم_الطالب', student_name,
      'رقم_هوية_الطالب', student_national_id,
      'رقم_جوال_الطالب', student_mobile,
      'تاريخ_الميلاد', birth_date,
      'الحي_العنوان', address,
      'المرحلة_الدراسية', stage,
      'الصف_الدراسي', grade,
      'اسم_ولي_الامر', guardian_name,
      'رقم_جوال_ولي_الامر', guardian_phone,
      'رقم_هوية_ولي_الامر', guardian_national_id,
      'صلة_ولي_الامر', guardian_relation,
      'حالة_الطلب', case request_status when 'في_الانتظار' then 'انتظار' else request_status end,
      'سبب_الرفض', rejection_reason,
      'الحلقة_المسكنة', assigned_circle_name,
      'تاريخ_الطلب', requested_at,
      'تاريخ_المعالجة', processed_at
    ) order by requested_at desc), '[]'::jsonb)
    into v_rows
    from public.registration_requests
    where coalesce(v_status,'') = ''
       or request_status = v_status
       or (v_status = 'انتظار' and request_status = 'في_الانتظار');

    return jsonb_build_object('نجاح', true, 'طلبات', v_rows);
  end if;

  if p_action = 'قبول_طلب_تسجيل' then
    select * into v_request from public.registration_requests where request_no = p_data->>'رقم_الطلب' limit 1;
    if not found then return jsonb_build_object('نجاح', false, 'خطأ', 'الطلب غير موجود'); end if;

    v_circle_name := coalesce(p_data->>'الحلقة', v_request.assigned_circle_name);
    select id into v_circle_id from public.circles where circle_name = v_circle_name limit 1;
    v_student_code := public.next_student_code();

    insert into public.students(student_code, full_name, national_id, mobile, birth_date, address, stage, grade, circle_id, circle_name, memorized_parts, status_name, registration_date)
    values (v_student_code, v_request.student_name, v_request.student_national_id, v_request.student_mobile, v_request.birth_date, v_request.address, v_request.stage, v_request.grade, v_circle_id, v_circle_name, 0, 'منتظم', current_date)
    returning id into v_student_id;

    insert into public.guardians(student_id, student_code, guardian_name, guardian_phone, guardian_national_id, relation)
    values (v_student_id, v_student_code, v_request.guardian_name, v_request.guardian_phone, v_request.guardian_national_id, v_request.guardian_relation);

    update public.registration_requests
    set request_status = 'مقبول', assigned_circle_id = v_circle_id, assigned_circle_name = v_circle_name, processed_at = now(), processed_by = v_uid, updated_at = now()
    where id = v_request.id;

    return jsonb_build_object('نجاح', true, 'رسالة', 'تم قبول الطلب وإضافة الطالب', 'رقم_الطالب', v_student_code);
  end if;

  if p_action = 'رفض_طلب_تسجيل' then
    update public.registration_requests
    set request_status = 'مرفوض', rejection_reason = p_data->>'سبب_الرفض', processed_at = now(), processed_by = v_uid, updated_at = now()
    where request_no = p_data->>'رقم_الطلب';
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'تحويل_للانتظار' then
    update public.registration_requests
    set request_status = 'في_الانتظار', processed_at = now(), processed_by = v_uid, updated_at = now()
    where request_no = p_data->>'رقم_الطلب';
    return jsonb_build_object('نجاح', true);
  end if;

  -- طلبات التعديل
  if p_action = 'جلب_طلبات_التعديل' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'رقم_الطلب', request_no,
      'رقم_الطالب', student_code,
      'اسم_الطالب', student_name,
      'الحقل_المراد_تعديله', field_name,
      'القيمة_القديمة', old_value,
      'القيمة_الجديدة', new_value,
      'حالة_الطلب', case request_status when 'جديد' then 'بانتظار المراجعة' else request_status end,
      'تاريخ_الطلب', requested_at,
      'تاريخ_المعالجة', processed_at
    ) order by requested_at desc), '[]'::jsonb)
    into v_rows
    from public.edit_requests;

    return jsonb_build_object('نجاح', true, 'طلبات', v_rows);
  end if;

  if p_action = 'قبول_طلب_تعديل' then
    select * into v_request from public.edit_requests where request_no = p_data->>'رقم_الطلب' limit 1;
    if not found then return jsonb_build_object('نجاح', false, 'خطأ', 'الطلب غير موجود'); end if;

    v_updates := jsonb_build_object(v_request.field_name, v_request.new_value);
    if v_request.field_name in ('اسم_ولي_الامر','رقم_جوال_ولي_الامر','رقم_هوية_ولي_الامر','صلة_ولي_الامر') then
      update public.guardians g
      set
        guardian_name = case when v_request.field_name = 'اسم_ولي_الامر' then v_request.new_value else guardian_name end,
        guardian_phone = case when v_request.field_name = 'رقم_جوال_ولي_الامر' then v_request.new_value else guardian_phone end,
        guardian_national_id = case when v_request.field_name = 'رقم_هوية_ولي_الامر' then v_request.new_value else guardian_national_id end,
        relation = case when v_request.field_name = 'صلة_ولي_الامر' then v_request.new_value else relation end,
        updated_at = now()
      where g.student_id = v_request.student_id;
    else
      perform public.apply_student_ar_updates(v_request.student_id, v_updates);
    end if;

    update public.edit_requests set request_status='مقبول', processed_at=now(), processed_by=v_uid, updated_at=now() where id=v_request.id;
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'رفض_طلب_تعديل' then
    update public.edit_requests set request_status='مرفوض', processed_at=now(), processed_by=v_uid, updated_at=now()
    where request_no = p_data->>'رقم_الطلب';
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'تعبئة_بيانات_طالب_ناقصة' then
    select * into v_student from public.students where student_code = p_data->>'رقم_الطالب' limit 1;
    if not found then return jsonb_build_object('نجاح', false, 'خطأ', 'الطالب غير موجود'); end if;
    perform public.apply_student_ar_updates(v_student.id, coalesce(p_data->'تعديلات','{}'::jsonb));
    if coalesce(p_data->'تعديلات_ولي_الامر','{}'::jsonb) <> '{}'::jsonb then
      perform public.app_api('تعديل_بيانات_طالب', jsonb_build_object('رقم_الطالب', v_student.student_code, 'تعديلات_ولي_الامر', p_data->'تعديلات_ولي_الامر'));
    end if;
    return jsonb_build_object('نجاح', true);
  end if;

  -- الإنذارات التعليمية
  if p_action = 'إصدار_إنذار_تعليمي' then
    select * into v_student from public.students where student_code = p_data->>'رقم_الطالب' limit 1;
    insert into public.educational_warnings(warning_no, student_id, student_code, student_name, circle_id, circle_name, reason, action_status, supervisor_name, issue_date, created_by)
    values (
      'EW-' || to_char(now(),'YYYYMMDDHH24MISS') || '-' || upper(substr(gen_random_uuid()::text,1,4)),
      v_student.id,
      coalesce(v_student.student_code, p_data->>'رقم_الطالب'),
      coalesce(v_student.full_name, p_data->>'اسم_الطالب'),
      v_student.circle_id,
      coalesce(v_student.circle_name, p_data->>'الحلقة'),
      p_data->>'سبب_الانذار',
      'بانتظار الإدارة',
      p_data->>'اسم_المشرف',
      current_date,
      v_uid
    );
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'جلب_الانذارات_التعليمية' then
    v_search := coalesce(p_data->>'بحث','');
    select coalesce(jsonb_agg(jsonb_build_object(
      'رقم_الانذار', warning_no,
      'رقم_الطالب', student_code,
      'اسم_الطالب', student_name,
      'الحلقة', circle_name,
      'سبب_الانذار', reason,
      'حالة_الإجراء', action_status,
      'اسم_المشرف', supervisor_name,
      'تاريخ_الإصدار', issue_date,
      'تاريخ_الإغلاق', close_date,
      'ملاحظات', notes
    ) order by issue_date desc, created_at desc), '[]'::jsonb)
    into v_rows
    from public.educational_warnings
    where v_search = '' or student_name ilike '%'||v_search||'%' or student_code = v_search;
    return jsonb_build_object('نجاح', true, 'انذارات', v_rows);
  end if;

  if p_action = 'تحديث_إجراء_انذار_تعليمي' then
    update public.educational_warnings
    set action_status = p_data->>'الإجراء',
        close_date = case when coalesce((p_data->>'مكتمل')::boolean, false) then current_date else close_date end,
        closed_by = case when coalesce((p_data->>'مكتمل')::boolean, false) then v_uid else closed_by end,
        updated_at = now()
    where warning_no = p_data->>'رقم_الانذار';
    return jsonb_build_object('نجاح', true);
  end if;

  -- الإنذارات الإدارية: الأرشيف فقط الآن، والمستحقون محسوبون من الحضور عند توفره
  if p_action = 'جلب_ارشيف_انذارات_ادارية' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'رقم_الانذار', warning_no,
      'رقم_الطالب', student_code,
      'اسم_الطالب', student_name,
      'الحلقة', circle_name,
      'نوع_الانذار', warning_type,
      'رقم_العتبة', threshold_no,
      'عدد_المخالفات', violations_count,
      'حالة_الإجراء', action_status,
      'تاريخ_الاستحقاق', due_date,
      'تاريخ_الإغلاق', close_date,
      'ملاحظات', notes
    ) order by due_date desc, created_at desc), '[]'::jsonb)
    into v_rows
    from public.administrative_warnings
    where coalesce(p_data->>'نوع_الانذار','') = '' or warning_type = p_data->>'نوع_الانذار';
    return jsonb_build_object('نجاح', true, 'انذارات', v_rows);
  end if;

  if p_action = 'جلب_مستحقي_الانذار_الاداري' then
    -- يرجع قائمة فارغة إذا لم يتم رفع سجل الحضور بعد
    return jsonb_build_object('نجاح', true, 'طلاب', '[]'::jsonb, 'مستحقون', '[]'::jsonb);
  end if;

  if p_action = 'تحديث_إجراء_انذار_اداري' then
    insert into public.administrative_warnings(warning_no, student_code, student_name, circle_name, warning_type, threshold_no, violations_count, action_status, due_date, close_date, created_by)
    values (
      'AW-' || to_char(now(),'YYYYMMDDHH24MISS') || '-' || upper(substr(gen_random_uuid()::text,1,4)),
      p_data->>'رقم_الطالب',
      p_data->>'اسم_الطالب',
      p_data->>'الحلقة',
      p_data->>'نوع_الانذار',
      nullif(p_data->>'رقم_العتبة','')::int,
      coalesce(nullif(p_data->>'عدد_المخالفات','')::int, 0),
      p_data->>'الإجراء',
      current_date,
      case when coalesce((p_data->>'مكتمل')::boolean,false) then current_date else null end,
      v_uid
    );
    return jsonb_build_object('نجاح', true);
  end if;

  -- الحضور
  if p_action = 'تسجيل_حضور' then
    select * into v_student from public.students where student_code = p_data->>'رقم_الطالب' limit 1;
    insert into public.attendance_records(student_id, student_code, student_name, circle_id, circle_name, attendance_date, attendance_type, note, recorded_by)
    values (v_student.id, v_student.student_code, v_student.full_name, v_student.circle_id, v_student.circle_name, coalesce(nullif(p_data->>'التاريخ','')::date,current_date), p_data->>'نوع_الغياب', p_data->>'ملاحظة', v_uid)
    on conflict (student_id, attendance_date) where student_id is not null do update set
      attendance_type = excluded.attendance_type,
      note = excluded.note,
      updated_at = now();
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'جلب_سجل_حضور_طالب' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'رقم_الطالب', student_code,
      'اسم_الطالب', student_name,
      'الحلقة', circle_name,
      'التاريخ', attendance_date,
      'نوع_الغياب', attendance_type,
      'ملاحظة', note
    ) order by attendance_date desc), '[]'::jsonb)
    into v_rows
    from public.attendance_records
    where student_code = p_data->>'رقم_الطالب';
    return jsonb_build_object('نجاح', true, 'سجل', v_rows);
  end if;

  -- القوالب والعتبات والإجراءات
  if p_action = 'جلب_قوالب_الرسائل' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'نوع_القالب', template_type,
      'عنوان_القالب', template_title,
      'نص_القالب', template_body,
      'المتغيرات', array_to_string(variables, ','),
      '_صف', template_type
    ) order by template_title), '[]'::jsonb)
    into v_rows
    from public.message_templates
    where is_active = true;
    return jsonb_build_object('نجاح', true, 'قوالب', v_rows);
  end if;

  if p_action = 'حفظ_قالب_رسالة' then
    update public.message_templates
    set template_body = p_data->>'نص_القالب', updated_at = now()
    where template_type = p_data->>'_صف' or template_title = p_data->>'عنوان_القالب';
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'جلب_عتبات_الانذارات' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'نوع_المخالفة', violation_type,
      'رقم_العتبة', threshold_no,
      'عدد_المخالفات_للاستحقاق', violations_required,
      'الإجراء_الافتراضي', default_action
    ) order by violation_type, threshold_no), '[]'::jsonb)
    into v_rows
    from public.warning_thresholds
    where is_active = true;
    return jsonb_build_object('نجاح', true, 'عتبات', v_rows);
  end if;

  if p_action = 'حفظ_عتبات_الانذارات' then
    for v_row in select * from jsonb_to_recordset(coalesce(p_data->'عتبات','[]'::jsonb)) as x(نوع_المخالفة text, رقم_العتبة int, عدد_المخالفات_للاستحقاق int, الإجراء_الافتراضي text) loop
      insert into public.warning_thresholds(violation_type, threshold_no, violations_required, default_action)
      values (v_row.نوع_المخالفة, v_row.رقم_العتبة, v_row.عدد_المخالفات_للاستحقاق, v_row.الإجراء_الافتراضي)
      on conflict (violation_type, threshold_no) do update set
        violations_required = excluded.violations_required,
        default_action = excluded.default_action,
        is_active = true,
        updated_at = now();
    end loop;
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'جلب_الاجراءات' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'نوع_الاجراء', action_type,
      'اسم_الاجراء', action_name,
      'الترتيب', sort_order,
      'نشط', case when is_active then 'نعم' else 'لا' end
    ) order by action_type, sort_order), '[]'::jsonb)
    into v_rows
    from public.warning_actions
    where is_active = true
      and (coalesce(p_data->>'نوع_الاجراء','') = '' or action_type = p_data->>'نوع_الاجراء' or action_type = 'سبب_تعليمي');
    return jsonb_build_object('نجاح', true, 'إجراءات', v_rows);
  end if;

  if p_action = 'إضافة_إجراء' then
    insert into public.warning_actions(action_type, action_name, sort_order, is_active)
    values (p_data->>'نوع_الاجراء', p_data->>'اسم_الاجراء', 99, true)
    on conflict (action_type, action_name) do update set is_active = true, updated_at = now();
    return jsonb_build_object('نجاح', true);
  end if;

  if p_action = 'حذف_إجراء' then
    update public.warning_actions set is_active = false, updated_at = now()
    where action_name = p_data->>'اسم_الاجراء';
    return jsonb_build_object('نجاح', true);
  end if;

  -- العاملون
  if p_action = 'جلب_العاملين' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'الاسم', full_name,
      'الوظيفة', job_title,
      'الحلقة', coalesce(c.circle_name, up.circle_name),
      'رمز_الدخول', legacy_login_code,
      'رقم_الجوال', phone,
      'تاريخ_الإضافة', up.created_at,
      'نشط', case when up.is_active then 'نعم' else 'لا' end
    ) order by full_name), '[]'::jsonb)
    into v_rows
    from public.user_profiles up
    left join public.circles c on c.id = up.circle_id;
    return jsonb_build_object('نجاح', true, 'عاملون', v_rows);
  end if;

  -- التقارير
  if p_action = 'جلب_تقارير_مشرف_اداري' then
    return jsonb_build_object('نجاح', true, 'تقارير', jsonb_build_object(
      'إجمالي_الطلاب', (select count(*) from public.students),
      'طلاب_منتظمون', (select count(*) from public.students where status_name='منتظم'),
      'طلاب_موقوفون', (select count(*) from public.students where status_name='موقوف'),
      'طلبات_جديدة', (select count(*) from public.registration_requests where request_status='جديد'),
      'طلبات_انتظار', (select count(*) from public.registration_requests where request_status='في_الانتظار'),
      'إنذارات_اداري_تأخر_مستحقة', (select count(*) from public.administrative_warnings where warning_type='تأخر' and close_date is null),
      'ارشيف_تأخر', (select count(*) from public.administrative_warnings where warning_type='تأخر' and close_date is not null),
      'إنذارات_اداري_غياب_مستحقة', (select count(*) from public.administrative_warnings where warning_type='غياب' and close_date is null),
      'ارشيف_غياب', (select count(*) from public.administrative_warnings where warning_type='غياب' and close_date is not null),
      'إنذارات_اداري_عذر_مستحقة', (select count(*) from public.administrative_warnings where warning_type='غياب_بعذر' and close_date is null),
      'ارشيف_عذر', (select count(*) from public.administrative_warnings where warning_type='غياب_بعذر' and close_date is not null),
      'انذ_تعليمية_مفتوحة', (select count(*) from public.educational_warnings where close_date is null)
    ));
  end if;

  if p_action = 'جلب_تقارير_مشرف_تعليمي' then
    return jsonb_build_object('نجاح', true, 'تقارير', jsonb_build_object(
      'إجمالي_الطلاب', (select count(*) from public.students),
      'عدد_الحلق', (select count(*) from public.circles where is_active=true),
      'مجموع_الحفظ', (select coalesce(sum(memorized_parts),0) from public.students),
      'انذارات_تعليمية_مفتوحة', (select count(*) from public.educational_warnings where close_date is null),
      'انذارات_تعليمية_مكتملة', (select count(*) from public.educational_warnings where close_date is not null)
    ));
  end if;

  if p_action = 'جلب_تقارير_معلم' then
    v_circle_name := p_data->>'الحلقة';
    return jsonb_build_object('نجاح', true, 'تقارير', jsonb_build_object(
      'إجمالي_طلاب_الحلقة', (select count(*) from public.students where circle_name = v_circle_name),
      'منتظمون', (select count(*) from public.students where circle_name = v_circle_name and status_name='منتظم'),
      'مجموع_حفظ_الحلقة', (select coalesce(sum(memorized_parts),0) from public.students where circle_name = v_circle_name),
      'متوسط_حفظ_الحلقة', (select round(coalesce(avg(memorized_parts),0),2) from public.students where circle_name = v_circle_name)
    ));
  end if;

  -- التهيئة المجمعة: ترجع نفس المفاتيح التي يتوقعها staff.html
  if p_action = 'جلب_بيانات_التهيئة' then
    declare
      v_role text := coalesce(p_data->>'الوظيفة','');
      v_circle text := coalesce(p_data->>'الحلقة','');
      v_students_result jsonb;
      v_circles_full jsonb;
      v_circle_names jsonb;
      v_status_names jsonb;
      v_actions_all jsonb;
      v_actions_edu jsonb;
      v_reasons jsonb;
      v_req_all jsonb;
      v_edit_all jsonb;
      v_edu_warnings jsonb;
      v_templates jsonb;
      v_thresholds jsonb;
      v_users jsonb;
      v_admin_kpi jsonb;
      v_edu_kpi jsonb;
      v_teacher_kpi jsonb;
      v_admin_arch jsonb;
    begin
      v_circles_full := public.app_api('جلب_الحلق','{}'::jsonb)->'حلق';
      select coalesce(jsonb_agg(x->>'اسم_الحلقة'), '[]'::jsonb) into v_circle_names from jsonb_array_elements(v_circles_full) x;

      select coalesce(jsonb_agg(x->>'اسم_الحالة'), '[]'::jsonb) into v_status_names
      from jsonb_array_elements(public.app_api('جلب_حالات_الطالب','{}'::jsonb)->'حالات') x;

      v_actions_all := public.app_api('جلب_الاجراءات','{}'::jsonb)->'إجراءات';
      select coalesce(jsonb_agg(x->>'اسم_الاجراء'), '[]'::jsonb) into v_actions_edu
      from jsonb_array_elements(v_actions_all) x where x->>'نوع_الاجراء' = 'تعليمي';
      select coalesce(jsonb_agg(x->>'اسم_الاجراء'), '[]'::jsonb) into v_reasons
      from jsonb_array_elements(v_actions_all) x where x->>'نوع_الاجراء' in ('سبب_تعليمي','تعليمي');

      v_templates := public.app_api('جلب_قوالب_الرسائل','{}'::jsonb)->'قوالب';
      v_thresholds := public.app_api('جلب_عتبات_الانذارات','{}'::jsonb)->'عتبات';
      v_users := public.app_api('جلب_العاملين','{}'::jsonb)->'عاملون';
      v_edu_warnings := public.app_api('جلب_الانذارات_التعليمية','{}'::jsonb)->'انذارات';
      v_admin_kpi := public.app_api('جلب_تقارير_مشرف_اداري','{}'::jsonb)->'تقارير';
      v_edu_kpi := public.app_api('جلب_تقارير_مشرف_تعليمي','{}'::jsonb)->'تقارير';
      v_admin_arch := public.app_api('جلب_ارشيف_انذارات_ادارية','{}'::jsonb)->'انذارات';

      if v_role = 'معلم' then
        v_students_result := public.app_api('جلب_طلاب_الحلقة', jsonb_build_object('الحلقة', v_circle));
        v_teacher_kpi := public.app_api('جلب_تقارير_معلم', jsonb_build_object('الحلقة', v_circle))->'تقارير';
        return jsonb_build_object('نجاح', true, 'طلاب', v_students_result->'طلاب', 'تقارير', v_teacher_kpi);
      end if;

      if v_role = 'مشرف_تعليمي' then
        v_students_result := public.app_api('جلب_الطلاب', jsonb_build_object('حجم_الصفحة', 999, 'الصفحة', 1));
        return jsonb_build_object(
          'نجاح', true,
          'تقارير', v_edu_kpi,
          'انذارات_تعليمية', v_edu_warnings,
          'طلاب', v_students_result->'طلاب',
          'حلق', v_circle_names,
          'قوالب', v_templates,
          'أسباب_تعليمية', v_reasons,
          'اجراءات_تعليمية', v_actions_edu
        );
      end if;

      if v_role = 'مشرف_اداري' or v_role = 'مشرف_النظام' then
        v_students_result := public.app_api('جلب_الطلاب', jsonb_build_object('حجم_الصفحة', 50, 'الصفحة', 1));
        v_req_all := public.app_api('جلب_طلبات_التسجيل','{}'::jsonb)->'طلبات';
        v_edit_all := public.app_api('جلب_طلبات_التعديل','{}'::jsonb)->'طلبات';

        return jsonb_build_object(
          'نجاح', true,
          'طلاب', v_students_result->'طلاب',
          'طلاب_مجموع', v_students_result->'المجموع',
          'طلاب_صفحات', v_students_result->'عدد_الصفحات',
          'حلق', v_circle_names,
          'حالات', v_status_names,
          'طلبات_جديدة', coalesce((select jsonb_agg(x) from jsonb_array_elements(v_req_all) x where x->>'حالة_الطلب' = 'جديد'), '[]'::jsonb),
          'طلبات_انتظار', coalesce((select jsonb_agg(x) from jsonb_array_elements(v_req_all) x where x->>'حالة_الطلب' = 'انتظار'), '[]'::jsonb),
          'طلبات_تعديل', v_edit_all,
          'انذارات_تعليمية', v_edu_warnings,
          'انذارات_ادارية_ارشيف', v_admin_arch,
          'قوالب', v_templates,
          'عتبات', v_thresholds,
          'اجراءات', v_actions_all,
          'أسباب_تعليمية', v_reasons,
          'عاملون', v_users,
          'kpi', v_admin_kpi
        );
      end if;

      if v_role = 'مدير' then
        return jsonb_build_object(
          'نجاح', true,
          'admin_kpi', v_admin_kpi,
          'edu_kpi', v_edu_kpi,
          'حلق', v_circles_full,
          'عاملون', v_users
        );
      end if;

      return jsonb_build_object('نجاح', true, 'ملفي', public.get_my_profile());
    end;
  end if;

  -- الإنجازات العامة
  if p_action = 'جلب_بيانات_الإنجازات_العامة' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'العنوان', title,
      'التصنيف', category,
      'التاريخ', achievement_date,
      'الوصف', description,
      'الصورة', image_url
    ) order by sort_order, achievement_date desc), '[]'::jsonb)
    into v_rows
    from public.achievements
    where is_published = true;
    return jsonb_build_object('نجاح', true, 'إنجازات', v_rows);
  end if;

  return jsonb_build_object('نجاح', false, 'خطأ', 'إجراء غير معروف في Supabase: ' || coalesce(p_action,''));
end;
$$;

grant execute on function public.student_ar_json(uuid) to anon, authenticated;
grant execute on function public.next_student_code() to authenticated;
grant execute on function public.apply_student_ar_updates(uuid, jsonb) to authenticated;
grant execute on function public.app_api(text, jsonb) to anon, authenticated;

commit;

-- =====================================================================
-- اختبار سريع بعد التشغيل:
-- select public.app_api('جلب_حالات_الطالب', '{}'::jsonb);
-- select public.app_api('جلب_الحلق', '{}'::jsonb);
-- =====================================================================
