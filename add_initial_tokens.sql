-- Funkcja, która będzie wywoływana po utworzeniu nowego użytkownika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Dodaj rekord w tabeli credits z 18 tokenami dla nowego użytkownika
  INSERT INTO public.credits (user_id, tokens, image_generation_count)
  VALUES (NEW.id, 18, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger, który wywołuje funkcję po utworzeniu nowego użytkownika
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 