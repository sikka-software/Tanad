-- Create enum types for activity logs

create type public.activity_log_action_type as enum (
  'CREATED',
  'UPDATED',
  'DELETED',
  'INVITED',
  'JOINED',
  'LEFT',
  'LOGIN',
  'LOGOUT',
  'PASSWORD_RESET_REQUEST',
  'PASSWORD_RESET_SUCCESS',
  'EMAIL_VERIFIED'
  -- Add other relevant actions as needed
);

create type public.activity_log_target_type as enum (
  'ENTERPRISE',
  'USER',
  'EMPLOYEE',
  'ROLE',
  'PERMISSION',
  'INVOICE',
  'EXPENSE',
  'SETTING',
  'NOTIFICATION',
  'SYSTEM'
  -- Add other relevant target types as needed
);


