export function normalizePOIToFormData({ formData, poi, images }) {
  const {
    title,
    icon_type,
    additional_data = {}
  } = formData;

  const form = new FormData();

  // === 📌 Основные поля ===
  form.append('title', title);
  form.append('icon_type', icon_type);
  form.append('map', poi.map);
  form.append('x', poi.x);
  form.append('y', poi.y);
  if (poi.room) form.append('room', poi.room);

  if ('target_room' in formData) {
    form.append('target_room', formData.target_room);
  }

  // Только если есть какие-то дополнительные данные вообще
  if (Object.keys(additional_data).length > 0) {
    form.append('additional_data', JSON.stringify(additional_data));
  }

  // === 🖼️ Работа с изображениями ===

  // Сохраняем порядок слайдов
  const imagesOrder = images
    .map((img, index) =>
      img.id && img.id !== 'main' ? { id: img.id, order: index } : null
    )
    .filter(Boolean);
  form.append('images_order', JSON.stringify(imagesOrder));

  // Новые изображения
  images.forEach(img => {
    if (img.type === 'new') {
      form.append('new_images', img.file);
    }
  });

  // Удалённые изображения
  const existingIds = poi.images ? poi.images.map(img => img.id) : [];
  const currentIds = images
    .map(img => img.id)
    .filter(id => id && id !== 'main' && typeof id === 'number');

  const deletedIds = existingIds.filter(id => !currentIds.includes(id));
  form.append('deleted_images', JSON.stringify(deletedIds));

  // === 🔍 Отладка ===
  for (let [key, value] of form.entries()) {
    console.log(`${key}:`, value);
  }

  return form;
}
