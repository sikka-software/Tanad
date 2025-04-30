# Making changes to the DB

- run the following command to create a new migration file

```
supabase migration new FILE_NAME
```

- add the sql query to the newly created file in `/supabase/migrations/FILE_NAME`
- run `supabase push` to apply the migrations to the db.

If any changes are made to `src/db/schema.ts` or `src/db/relations.ts` then we'll need to run `drizzle-kit generate` to generate the migrations files from the changes we made to the drizzle schema. And after that we can run `supabase push` to apply the migrations.

# Adding Permissions

The superadmin predefined role has the id: `e5a42bf8-12a8-4ac9-89f8-1f2ee46ed44b`

```
 insert into
  permissions (role_id, permission)
values
  (
    'e5a42bf8-12a8-4ac9-89f8-1f2ee46ed44b',
    'companies.read'
  ),
  (
    'e5a42bf8-12a8-4ac9-89f8-1f2ee46ed44b',
    'companies.create'
  ),
  (
    'e5a42bf8-12a8-4ac9-89f8-1f2ee46ed44b',
    'companies.delete'
  ),
  (
    'e5a42bf8-12a8-4ac9-89f8-1f2ee46ed44b',
    'companies.update'
  );
```
