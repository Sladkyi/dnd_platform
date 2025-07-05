export const createIncomingMessageHandler = ({
  myShapeId,
  role,
  animateShape,
  setShapes,
  setPlayerShape,
  fetchSessionPlayers,
  setPlayers,
  positionRef,
  sessionId,
  movementLocks, // ⬅️ Добавляем сюда
  setTurnOrder,
  setCurrentTurnShapeId,
}) => {
  return (data) => {
    console.log(
      '📨 handleIncomingMessage получил сырое сообщение:',
      JSON.stringify(data, null, 2)
    );

    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Получено некорректное сообщение (не объект):', data);
      return;
    }

    if (data.type === 'connection') {
      console.log('🔗 WebSocket соединение установлено:', data.status);
      return;
    }

    if (!data.action) {
      console.warn('⚠️ Сообщение без поля action. Полный объект:', data);
      return;
    }
    if (data.error) {
      console.error('❌ Ошибка с сервера:', data.error);

      if (data.error === 'too_many_requests') {
        delete movementLocks.current[myShapeId]; // 👈 снимаешь блокировку именно своей фигуры
        console.warn('🚫 Блокировка снята из-за throttle ошибки');
      }

      return;
    }
    switch (data.action) {
      case 'move':
        if (data.payload) {
          const { id, x, y, duration = 400 } = data.payload;

          if (id === myShapeId) {
            console.log(
              '🔄 Получено движение своей фигуры - пропускаем анимацию'
            );
            break;
          }

          // 🔒 Блокировка: если фигура локально заблокирована — игнорируем сообщение
          if (movementLocks.current[id]) {
            console.log(
              '⏳ Локальная анимация в процессе для фигуры',
              id,
              '- игнорируем серверное обновление'
            );
            break;
          }

          console.log(`🚶 Перемещаю фигуру ${id} в (${x}, ${y})`);
          animateShape(id, x, y, duration);
        } else {
          console.warn('⚠️ Пустой payload для действия move');
        }
        break;

      case 'create':
        if (data.payload) {
          console.log('🆕 Создаю новую фигуру:', data.payload);

          setShapes((prev) =>
            prev.some((s) => s.id === data.payload.id)
              ? prev
              : [...prev, data.payload]
          );
        } else {
          console.warn('⚠️ Пустой payload для действия create');
        }
        break;

      case 'delete':
        if (data.payload) {
          console.log('🗑️ Удаляю фигуру с id:', data.payload.id);

          setShapes((prev) => prev.filter((s) => s.id !== data.payload.id));
        } else {
          console.warn('⚠️ Пустой payload для действия delete');
        }
        break;

      case 'map_sync':
        if (Array.isArray(data.payload) && data.payload.length > 0) {
          console.log(
            '🌍 Синхронизация карты. Полученные фигуры:',
            data.payload
          );

          const newShapes = data.payload.map((s) => ({ ...s }));
          setShapes(newShapes);

          const myShape = newShapes.find((s) => s.id === myShapeId);
          if (myShape) {
            console.log('✅ Синхронизировал позицию своей фигуры:', myShape);
            setPlayerShape(myShape);
            positionRef.current = { x: myShape.x, y: myShape.y };
          }
        } else {
          console.log('🌍 Пустая синхронизация — обнуляю фигуры');
          setShapes([]);
        }
        break;

      case 'update':
        if (data.payload) {
          const updated = data.payload;

          console.log('🔧 Обновляю фигуру:', updated);

          setShapes((prev) =>
            prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
          );

          if (updated.id === myShapeId && role === 'player') {
            setPlayerShape((prev) => ({ ...prev, ...updated }));

            if (updated.x !== undefined || updated.y !== undefined) {
              positionRef.current = {
                x: updated.x ?? positionRef.current.x,
                y: updated.y ?? positionRef.current.y,
              };
            }
          }
        } else {
          console.warn('⚠️ Пустой payload для действия update');
        }
        break;
      case 'turn_order_update':
        console.log(data.payload);
        if (data.payload?.new_shape_id) {
          console.log(
            '➕ Новый игрок добавлен в очередь:',
            data.payload.new_shape_id
          );
          // Функция для обновления очереди на фронте
          setTurnOrder((prevOrder) => [
            ...prevOrder,
            data.payload.new_shape_id,
          ]);
        } else {
          console.warn('⚠️ Пустой payload в turn_order_update');
        }
        break;

      case 'turn_update':
        console.log(data.payload);
        if (data.payload?.current_shape_id !== undefined) {
          console.log(
            '🎯 Сейчас ходит фигура с id:',
            data.payload.current_shape_id
          );
          // Функция для обновления активного хода
          setCurrentTurnShapeId(data.payload.current_shape_id);
        } else {
          console.warn('⚠️ Пустой payload в turn_update');
        }
        break;
      case 'session_update':
        if (role === 'master') {
          console.log('🎮 Сессия обновлена. Загружаю список игроков...');

          fetchSessionPlayers(sessionId)
            .then((response) => {
              console.log('✅ Игроки сессии обновлены:', response.data);
              setPlayers(response.data);
            })
            .catch((err) =>
              console.error('❌ Не удалось обновить список игроков:', err)
            );
        } else {
          console.log(
            'ℹ️ Получено session_update, но роль не master — пропускаем'
          );
        }
        break;

      default:
        console.warn('⚠️ Неизвестное действие:', data.action);
    }
  };
};
