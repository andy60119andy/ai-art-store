insert into public.product_categories(name,slug) values ('客製藝術畫','custom-art') on conflict (slug) do nothing;
insert into public.products(category_id,name,slug,description,base_price_twd)
select id,'客製藝術掛畫','custom-wall-art','AI 生成專屬藝術作品',1280 from public.product_categories where slug='custom-art'
on conflict (slug) do nothing;
insert into public.product_sizes(product_id,name,width_mm,height_mm,price_delta_twd)
select id,'A4',210,297,0 from public.products where slug='custom-wall-art'
on conflict (product_id,name) do nothing;
insert into public.product_sizes(product_id,name,width_mm,height_mm,price_delta_twd)
select id,'A3',297,420,500 from public.products where slug='custom-wall-art'
on conflict (product_id,name) do nothing;
insert into public.frames(name,material,color,price_delta_twd) values
('經典黑框','木質','黑',0),('自然木框','木質','原木',300)
on conflict do nothing;
insert into public.papers(name,description,price_delta_twd) values
('藝術微噴紙','高解析藝術輸出',0),('霧面藝術紙','細緻霧面質感',150);