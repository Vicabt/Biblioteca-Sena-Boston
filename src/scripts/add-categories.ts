import { createCategory } from '@/lib/firebase/categories';

// Estructura de categorías organizadas por grupos
const categoryGroups = [
  {
    group: "Ficción",
    categories: [
      "Novela contemporánea",
      "Ficción histórica",
      "Ciencia ficción",
      "Fantasía",
      "Misterio / Suspenso",
      "Terror / Horror",
      "Romance",
      "Aventura",
      "Ficción distópica",
      "Realismo mágico"
    ]
  },
  {
    group: "No ficción",
    categories: [
      "Biografía / Autobiografía",
      "Historia",
      "Ciencia",
      "Psicología",
      "Filosofía",
      "Política",
      "Sociología",
      "Economía",
      "Autoayuda / Desarrollo personal",
      "Ensayo"
    ]
  },
  {
    group: "Infantil y juvenil",
    categories: [
      "Cuentos infantiles",
      "Literatura juvenil",
      "Libros ilustrados",
      "Fábulas y leyendas",
      "Educativos para niños"
    ]
  },
  {
    group: "Académico / Técnico",
    categories: [
      "Matemáticas",
      "Física",
      "Química",
      "Informática / Programación",
      "Medicina / Salud",
      "Ingeniería",
      "Derecho",
      "Educación",
      "Pedagogía"
    ]
  },
  {
    group: "Cultura y sociedad",
    categories: [
      "Religión / Espiritualidad",
      "Antropología",
      "Mitología",
      "Estudios de género",
      "Ecología / Medio ambiente"
    ]
  },
  {
    group: "Arte y creatividad",
    categories: [
      "Arte / Historia del arte",
      "Música",
      "Fotografía",
      "Diseño gráfico",
      "Arquitectura",
      "Cine / Teatro",
      "Moda"
    ]
  },
  {
    group: "Otros intereses",
    categories: [
      "Cocina / Gastronomía",
      "Viajes / Guías turísticas",
      "Deportes",
      "Jardinería",
      "Manualidades",
      "Negocios / Emprendimiento"
    ]
  }
];

// Función para agregar las categorías principales
async function addMainCategories() {
  try {
    // Agregar las categorías principales (grupos)
    for (const group of categoryGroups) {
      await createCategory({ name: group.group });
      console.log(`Categoría principal agregada: ${group.group}`);
    }
    console.log('Todas las categorías principales han sido agregadas.');
  } catch (error) {
    console.error('Error al agregar categorías principales:', error);
  }
}

// Función para agregar todas las subcategorías
async function addAllSubcategories() {
  try {
    // Agregar todas las subcategorías
    for (const group of categoryGroups) {
      for (const category of group.categories) {
        await createCategory({ name: category });
        console.log(`Subcategoría agregada: ${category}`);
      }
    }
    console.log('Todas las subcategorías han sido agregadas.');
  } catch (error) {
    console.error('Error al agregar subcategorías:', error);
  }
}

// Función para agregar todas las categorías (principales y subcategorías)
export async function addAllCategories() {
  try {
    await addMainCategories();
    await addAllSubcategories();
    console.log('Proceso de agregación de categorías completado con éxito.');
    return true;
  } catch (error) {
    console.error('Error en el proceso de agregación de categorías:', error);
    return false;
  }
}

// Para ejecutar el script directamente
// Descomentar la siguiente línea para ejecutar
// addAllCategories();