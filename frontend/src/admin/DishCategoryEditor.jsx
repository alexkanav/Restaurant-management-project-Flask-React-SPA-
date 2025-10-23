import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import { Form, SelectType, InputType, ImageUploader, Spinner } from '../components';
import { imgFolder, maxDishPrice } from '../../config.json';


export default function DishCategoryEditor() {
  const [categories, setCategories] = useState(null);
  const [categoryIdMap, setCategoryIdMap] = useState(null);
  const [dishes, setDishes] = useState(null);
  const [selectedCategoryNumb, setSelectedCategoryNumb] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDishCode, setNewDishCode] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newCategoryPosition, setNewCategoryPosition] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await sendToServer('admin/api/menu', null, 'GET');

        if (data?.categories && data?.dishes) {
          setCategories(data.categories);
          setCategoryIdMap(data.categoryIdMap);
          setDishes(data.dishes);
        } else {
          throw new Error('Menu data is incomplete');
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        toast.error('Помилка завантаження меню.');
      }
    };
    fetchMenu();
  }, [reloadTrigger]);

  const updateCategories = async (categories) => {
    try {
      const { data } = await sendToServer('admin/api/category/update', { categories }, 'POST');
      toast.success(data.message || 'Категорії оновлено');
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || 'Помилка оновлення БД');
    }
  };

  const sendNewDish = async (dish) => {
    try {
      const { data } = await sendToServer('admin/api/dish/update', dish, 'POST');
      toast.success(data.message || 'Страву оновлено');
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || 'Помилка оновлення БД');
    }
  };

  const changeCategory = (newName) => {
    const categoryNames = categories.map((category) => Object.keys(category)[0]);
    categoryNames.splice(newCategoryPosition - 1, 0, newName);
    updateCategories(categoryNames);

    // Reset form state
    setSelectedCategoryNumb('');
    setNewCategoryName('');
    setSelectedDish(null);
  };

  const selectCategoryNumb = (numberName) => {
    const [index, name] = numberName.split('/');
    setSelectedCategoryNumb(index);
    setSelectedCategoryName(name);
    setSelectedDish(null);
  };

  const addNewDish = (code) => {
    if (!Number.isInteger(Number(code))) {
      toast.error('Будь ласка, введіть ціле число.');
      setSelectedDish(null);
      return;
    }
    if (code in dishes) {
      toast.error(`Код:${code} вже існує.`);
      setSelectedDish(null);
      return;
    }
    setSelectedDish(code);
  };

  const dishUpdate = (formData) => {
    const price = Number(formData.price);

    if (isNaN(price) || price < 0 || price > maxDishPrice) {
      toast.error('Ви вказали некоректну ціну.');
      return;
    }

    const newDish = {
      code: selectedDish,
      name_ua: formData.dishname,
      category_id: categoryIdMap[selectedCategoryName],
      description: formData.description,
      price,
      image_link: newImage || formData.image_link,
    };

    sendNewDish(newDish);
    setSelectedDish(null);
    setNewImage(null);
  };

  if (!categories || !dishes) return <Spinner />;

  return (
    <>
      <SelectType
        title="Категорія"
        label="Category"
        value={
          selectedCategoryNumb !== '' && selectedCategoryName
            ? `${selectedCategoryNumb}/${selectedCategoryName}`
            : ''
        }
        onChange={selectCategoryNumb}
        items={[
          'Додати нову категорію',
          ...categories.map((category) => Object.keys(category)[0]),
        ]}
        formatValue={(name, index) => `${index}/${name}`}
      />

      {selectedCategoryNumb &&
        (selectedCategoryNumb === '0' ? (
          <>
            <SelectType
              title="Позиція Категорії"
              label="position"
              value={newCategoryPosition || 'Оберіть позицію'}
              onChange={setNewCategoryPosition}
              items={Array.from({ length: categories.length + 1 }, (_, i) => i + 1)}
            />
            <InputType
              title="Категорія"
              label="newCategory"
              value={newCategoryName}
              onChange={setNewCategoryName}
              buttonFunc={changeCategory}
            />
          </>
        ) : (
          <SelectType
            title="Страва"
            label="description"
            value={selectedDish || 'Оберіть страву'}
            onChange={setSelectedDish}
            items={[
              'Додати нову страву',
              ...Object.values(categories[selectedCategoryNumb - 1])[0],
            ]}
            formatValue={(name, index) => (index === 0 ? '0' : name)}
          />
        ))
      }

      {selectedDish &&
        (selectedDish === '0' ? (
          <InputType
            title="Страва"
            label="newDish"
            value={newDishCode}
            onChange={setNewDishCode}
            buttonFunc={addNewDish}
          />
        ) : (
          <>
            <img
              className="update-image"
              src={
                newImage
                  ? `${imgFolder}${newImage}`
                  : `${imgFolder}${dishes[selectedDish]?.image_link}`
              }
              loading="lazy"
              alt={dishes[selectedDish]?.name_ua || 'Зображення страви'}
              style={{ width: '100%', marginTop: '10px' }}
            />
            <ImageUploader setNewImage={setNewImage} />

            <Form
              key={selectedDish}
              fields={[
                {
                  label: 'Назва:',
                  name: 'dishname',
                  type: 'text',
                  placeholder: dishes[selectedDish]?.name || '',
                  maxLength: 50,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  placeholder: dishes[selectedDish]?.description || '',
                  maxLength: 500,
                },
                {
                  label: 'Ціна:',
                  name: 'price',
                  type: 'number',
                  placeholder: dishes[selectedDish]?.price || '',
                },
                {
                  label: 'Фото:',
                  name: 'image_link',
                  type: 'text',
                  placeholder:
                    newImage || dishes[selectedDish]?.image_link || '',
                  maxLength: 20,
                },
              ]}
              title={selectedDish}
              buttonText="Оновити"
              onSubmit={dishUpdate}
            />
          </>
        ))
      }
    </>
  );
}
