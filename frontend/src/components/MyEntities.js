import React, { useEffect, useState } from 'react';
import { Card, Button, Collapse, Row, Col } from 'react-bootstrap';

const MyEntities = ({ profile }) => {
    const [shapes, setShapes] = useState([]);
    const [open, setOpen] = useState(false); // состояние раскрытия

    const getMyEntities = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/profile/getEntities/${profile.id}/`);
            if (!response.ok) throw new Error("Не удалось получить данные.");

            const data = await response.json();
            console.log(data)
            setShapes(data); // весь массив объектов Shape
        } catch (error) {
            console.error("Ошибка при загрузке сущностей:", error);
        }
    };

    useEffect(() => {
        if (profile && profile.id) {
            getMyEntities();
        }
    }, [profile]);

    return (
        <div className="container mt-4">
            <Button
                onClick={() => setOpen(!open)}
                aria-controls="entity-collapse"
                aria-expanded={open}
                variant="primary"
            >
                {open ? 'Скрыть сущности' : 'Показать сущности'}
            </Button>

            <Collapse in={open}>
                <div id="entity-collapse" className="mt-3">
                    <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                        {shapes.length > 0 ? (
                            shapes.map((shape, index) => (
                              <Col key={shape.id || index}>
                                <Card className="h-100 shadow-sm" >
                                  <Card.Body>
                                    <Card.Title>{shape.name || 'Без имени'}</Card.Title>
                                    <Card.Text>
                                      Раса: {shape.race || '—'}<br/>
                                      Класс: {shape.character_class || '—'}<br/>
                                      Уровень: {shape.level}
                                    </Card.Text>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))
                                                    ) : (
                            <p>Нет сущностей для отображения.</p>
                        )}
                    </Row>
                </div>
            </Collapse>
        </div>
    );
};

export { MyEntities };
