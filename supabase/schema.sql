-- 暮らしの栞(shiori)用のテーブル定義。
-- Supabaseプロジェクトの SQL Editor でそのまま実行してください。
--
-- 保存されるのは暗号化されたvaultそのもの(payload)のみ。
-- パスワードや平文データはサーバーに一切渡らない。
-- id(帳面ID)は推測困難なランダム文字列を前提に、匿名キーからの読み書きを許可している。

create table if not exists vaults (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table vaults enable row level security;

drop policy if exists "anon can read/write by id" on vaults;
create policy "anon can read/write by id"
  on vaults
  for all
  using (true)
  with check (true);

-- Realtime(端末間のリアルタイム同期)を有効化する。
-- 既に追加済みの場合はエラーになるが無視してよい(2回目以降の実行時)。
do $$
begin
  alter publication supabase_realtime add table vaults;
exception when duplicate_object then
  null;
end $$;

