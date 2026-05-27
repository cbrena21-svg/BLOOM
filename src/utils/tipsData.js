import { Colors } from '../styles/colors';

export const CONSEJOS_FASES = {
    folicular: {
        colorTema: Colors.folicular || '#8E73A9',
        titulo: 'Fase Folicular',
        subtitulo: 'Nuevos comienzos, creatividad y apertura',
        fraseFrasco: 'Momento para plantar intenciones. ¿Qué deseas incrementar en tu vida hoy?',
        nutricion: {
            consejoGeneral: 'Tu metabolismo es un poco más lento, tienes menos apetito y tu cuerpo retiene nutrientes por naturaleza. Opta por platos frescos, ligeros y de cocción rápida.',
            tipsClave: [
                'Consume 1 cucharada diaria de semillas de lino y calabaza.',
                'Prioriza alimentos fermentados y probióticos.',
                'Consume verduras crudas y alimentos que "enfrían" el cuerpo.',
            ],
            listaSuper: {
                cereales: ['cebada', 'avena', 'centeno', 'trigo'],
                verduras: ['alcachofa', 'brócoli', 'zanahoria', 'lechuga francesa', 'lechuga boston', 'lechuga romana', 'perejil', 'guisante verde', 'ruibarbo', 'judías verdes', 'calabacines'],
                frutas: ['aguacate', 'toronja', 'limón', 'lima', 'naranja', 'ciruela', 'granada', 'cereza ácida'],
                legumbres: ['alubias', 'carilla', 'lenteja verde', 'alubias garrofón', 'alubias mungo', 'guisantes partidos'],
                semillas: ['nueces de brasil', 'anacardos', 'semillas de lino', 'lichi', 'semillas de calabaza'],
                carne: ['pollo'],
                mariscos: ['almeja de mar', 'cangrejo de costra blanda', 'trucha'],
                otros: ['mantequilla de frutos secos', 'aceitunas', 'encurtidos', 'chucrut', 'vinagre', 'huevos']
            }
        },
        ejercicio: {
            consejoGeneral: 'Tus niveles de energía y testosterona están subiendo. Tu sistema inmunitario está alerta y fuerte para entrenar potente.',
            tipsClave: [
                'Realiza entrenamientos de fuerza.',
                'Los primeros días post-menstruación activa tu cuerpo con cardio.',
                'Haz ejercicio por la mañana.',
                'Si experimentas fatiga o ansiedad, limita el ejercicio potente a 30 minutos.'
            ],
            sugeridos: ['Correr', 'Bicicleta', 'Bailar', 'Senderismo', 'Saltar a la cuerda', 'Clases de cama elástica']
        },
        proyectos: {
            consejoGeneral: 'El aumento de estrógeno optimiza tu memoria de trabajo, creatividad y capacidad para resolver problemas complejos.',
            tipsClave: [
                'Programa tus tareas intelectuales y de diseño de estrategias.',
            ],
            actividades: ['Diseña estrategias y planificar.', 'Sesiones de lluvia de ideas.', 'Inicia proyectos nuevos.', 'Resuelve problemas complejos.', 'Busca clientes nuevos.', 'Investiga ideas nuevas.', 'Toma decisiones grandes.']
        },
        relaciones: {
            consejoGeneral: 'Estás más receptiva a experiencias nuevas y con mayor energía social, aunque los niveles de estrógeno base sigan subiendo.',
            tipsClave: [
                'Usa lubricante.',
                'Prueben actividades novedosas en pareja.',
                'Fase perfecta para renovarse en el ámbito íntimo probando nuevas dinámicas o masajes.'
            ],
            planesIdeales: ['Viaja a un lugar desconocido.', 'Ve a un museo o espectáculo.', 'Sal a hacer ejercicio físico juntos.', 'Usa lubricante.']
        }
    },

    ovulatoria: {
        colorTema: Colors.ovulatoria || '#8295B6',
        titulo: 'Fase Ovulatoria',
        subtitulo: 'Socialización, comunicación y máximo magnetismo',
        fraseFrasco: 'Tu energía y magnetismo están al máximo. Momento ideal para conectar y brillar.',
        nutricion: {
            consejoGeneral: 'Es la fase más caliente del ciclo. Los niveles altos de estrógeno requieren alimentos frescos, crudos y ricos en fibra.',
            tipsClave: [
                'Consume 1 cucharada diaria de semillas de lino y calabaza.',
                'Consume alimentos crudos, ensaladas y zumos frescos.',
                'Consume mucha fibra.',
                'Sáciate con cereales ligeros.'
            ],
            listaSuper: {
                cereales: ['amaranto', 'maíz', 'quinoa'],
                verduras: ['espárragos', 'pimientos morrones rojos', 'coles de bruselas', 'acelgas', 'achicoria', 'cebollinos', 'diente de león', 'berenjena', 'endivia', 'escarola', 'ocra', 'cebolleta', 'espinacas', 'tomate'],
                frutas: ['albaricoque', 'melón cantalupo', 'coco', 'higo', 'guayaba', 'caquis', 'pérsimon', 'frambuesa', 'fresa'],
                legumbres: ['lenteja roja'],
                semillas: ['almendras', 'semillas de lino', 'nueces pecanas', 'pistachos', 'semillas de calabaza'],
                carne: ['cordero'],
                Mariscos: ['salmón', 'langostino', 'atún'],
                otros: ['alcohol con moderación', 'chocolate', 'café', 'ketchup', 'cúrcuma']
            }
        },
        ejercicio: {
            consejoGeneral: 'El estrógeno y la testosterona alcanzan sus picos máximos, otorgándote fuerza y resistencia de sobra.',
            tipsClave: [
                'Realiza entrenamientos intensos y demandantes.',
                'Asiste a clases grupales.'
            ],
            sugeridos: ['Sprints a intervalos', 'HIIT', 'Spinning', 'Boot camp', 'Kickboxing', 'Pesas rusas', 'Power yoga', 'Ciclo indoor']
        },
        proyectos: {
            consejoGeneral: 'El aluvión de estrógenos aumenta tus conexiones sinápticas, optimizando tu elocuencia y dotes de comunicación.',
            tipsClave: [
                'Ventana ideal del mes para pedir un aumento de sueldo, ascenso o negociar acuerdos.',
                'Potencia tu marketing escribiendo contenido para el mes o grabando videos.',
                'Aprovecha tu elocuencia para comidas de negocios, reuniones clave o eventos de networking.'
            ],
            actividades: ['Ten conversaciones importantes.', 'Pide un aumento o ascenso.', 'Ve a entrevistas laborales.', 'Escribe blogs y diseñar estrategias de marketing.', 'Publica en redes sociales.', 'Asiste a eventos de networking.', 'Negocia acuerdos y contratos.', 'Da charlas o conferencias.']
        },
        relaciones: {
            consejoGeneral: 'Fase biológicamente húmeda con el deseo sexual al máximo. Tus rasgos, voz y magnetismo son naturalmente atractivos.',
            tipsClave: [
                'Es el momento perfecto para primeras citas.',
                'Eres orgásmica por naturaleza en estos días; concéntrate en recibir placer sin culpas.',
                'Oportunidad ideal para conversar abiertamente en pareja sobre metas, sueños y fantasías.',
                'Organicen cenas con amigos o asistan a eventos sociales juntos.'
            ],
            planesIdeales: ['Disfruta de una cena con amigos.', 'Ve a una fiesta o evento social.', 'Habla de lo que esperan de la relación.', 'Ten primeras citas.', 'Compartan fantasías sexuales.']
        }
    },
    lutea: {
        colorTema: Colors.lutea || '#748E85',
        titulo: 'Fase Lútea',
        subtitulo: 'Focalización, organización y conclusión',
        fraseFrasco: 'Tu energía se interioriza. Momento ideal para cerrar ciclos, organizar tu entorno y escuchar tu cuerpo.',
        nutricion: {
            consejoGeneral: 'La progesterona ralentiza la digestión y tu metabolismo se acelera quemando más calorías al día, lo que aumenta el apetito.',
            tipsClave: [
                'Consume 1 cucharada diaria de semillas de sésamo y girasol.',
                'Consume carbohidratos complejos y hortalizas horneadas.',
                'Utiliza métodos de cocción cálidos. ',
                'Evita los alimentos crudos.',
                'Asegura dosis altas de calcio, magnesio y vitamina D.'
            ],
            listaSuper: {
                cereales: ['arroz integral', 'mijo'],
                verduras: ['repollo', 'coliflor', 'apio', 'berza', 'pepino', 'nabo daikon', 'ajo', 'jengibre', 'puerros', 'hojas de mostaza', 'cebolla', 'chirivía', 'calabaza de piel gruesa', 'rábano', 'calabaza cacahuete', 'camote)', 'berros'],
                frutas: ['manzana', 'dátiles', 'melocotón', 'pera', 'uvas pasas'],
                legumbres: ['garbanzos', 'alubia great northern', 'alubia blanca pequeña'],
                semillas: ['nueces pecanas', 'piñones', 'semillas de sésamo', 'semillas de girasol', 'nueces'],
                carne: ['buey', 'pavo'],
                Mariscos: ['bacalao', 'lenguado', 'fletán'],
                otros: ['menta', 'menta piperita', 'espirulina']
            }
        },
        ejercicio: {
            consejoGeneral: 'Tu cuerpo segrega más cortisol de forma natural y el sistema inmune reduce su marcha. Es momento de bajar la intensidad.',
            tipsClave: [
                'Evita el ejercicio excesivamente intenso, propicia el desgaste muscular.',
                'Los primeros cinco días haz fuerza.',
                'Los siguientes días cambia a flexibilidad.',
                'Realiza tus rutinas por la tarde.'
            ],
            sugeridos: ['Entrenamiento de fuerza', 'Levantamiento de pesas', 'Yoga intenso', 'HIIT moderado', 'Pilates', 'Barre', 'Yoga suave', 'Estiramientos', 'Recuperación']
        },
        proyectos: {
            consejoGeneral: 'Tu energía física se enfoca hacia tu interior. Es tu fase dorada para terminar tareas pendientes y realizar trabajo profundo.',
            tipsClave: [
                '¡No pospongas! Dedícate a concluir proyectos, cerrar contratos y corregir contenidos.',
                'Foco administrativo: organiza tus archivos digitales, limpia tu escritorio y archiva gastos.',
                'Reduce los compromisos sociales externos para evitar un cansancio innecesario.'
            ],
            actividades: ['Haz tareas administrativas.', 'Organiza el escritorio, oficina o documentos.', 'Trabajo profundo: revisión y corrección.', 'Revisa contratos e informes financieros.', 'Archiva informes de gastos.', 'Termina proyectos acumulados.']
        },
        relaciones: {
            consejoGeneral: 'La primera mitad se siente con deseo alto, mientras que la segunda mitad activa una intensa honestidad emocional sobre lo que necesita corregirse.',
            tipsClave: [
                'Usa la segunda mitad como una revisión de salud emocional; expresa tus quejas con amor.',
                'En el sexo: prioriza preliminares muy abundantes, uso de lubricante y un ritmo mucho más lento.',
                'Conécten a través del hogar planeando proyectos domésticos o cocinando juntos en una cita casera.'
            ],
            planesIdeales: ['Realicen proyectos domésticos juntos.', 'Evaluen la relación y conversar constructivamente.', 'Tengan una cita casera de noche.', 'Pregunta cómo mejorar la relación.', 'Expresa tus quejas con amor.', 'Usa lubricante y un ritmo más lento.']
        }
    },

    menstrual: {
        colorTema: Colors.menstrual || '#8E4A4E',
        titulo: 'Fase Menstrual',
        subtitulo: 'Introspección, renovación y descanso profundo',
        fraseFrasco: 'Momento de soltar lo que ya no te sirve y escuchar tu sabiduría interior.',
        nutricion: {
            consejoGeneral: 'Tus niveles hormonales están al mínimo. Es vital almacenar micronutrientes, proteínas y grasas saludables para reponer las pérdidas por el sangrado.',
            tipsClave: [
                'Consume 1 cucharada diaria de semillas de sésamo y girasol.',
                'Consume comidas calientes.',
                'Evita las grasas procesadas.',
                'Consume alimentos ricos en hierro, zinc y remineralizantes.'
            ],
            listaSuper: {
                cereales: ['trigo sarraceno', 'arroz salvaje'],
                verduras: ['remolacha', 'bardana', 'alga dulce', 'alga hijiki', 'col kale', 'alga kelp', 'alga kombu', 'champiñones', 'setas shiitake', 'alga wakame', 'castaña de agua'],
                frutas: ['mora', 'arándano', 'uva concord', 'sandía'],
                legumbres: ['alubias azuki', 'soja negra', 'alubia negra', 'alubias rojas'],
                semillas: ['castaña', 'semillas de sésamo', 'pipas de girasol'],
                carne: ['pato', 'cerdo'],
                Mariscos: ['siluro', 'slmejas', 'cangrejo', 'langosta', 'mejillones', 'pulpo', 'ostras', 'sardinas', 'vieiras', 'calamar'],
                otros: ['té bancha', 'café descafeinado', 'miso', 'sal', 'tamari']
            }
        },
        ejercicio: {
            consejoGeneral: 'Hormonas y energía al mínimo. Eres más propensa a respuestas inflamatorias, por lo que el ejercicio intenso estresará tu cuerpo.',
            tipsClave: [
                'Practica actividades restauradoras.',
                'El sueño profundo y sin interrupciones es clave.',
                'Si experimentas cólicos, enfócate en estiramientos diseñados para aliviar la pelvis bloqueada.'
            ],
            sugeridos: ['Caminar suave', 'Uso de rodillos de masaje', 'Yin yoga', 'Pilates sobre esterilla', 'Ejercicios de respiración profunda', 'Tomar siestas restauradoras', 'Postura del triángulo', 'Pinza de pie', 'Perro bocabajo', 'Postura del pez']
        },
        proyectos: {
            consejoGeneral: 'Fase para frenar y evaluar con amabilidad. La alta comunicación interhemisférica te otorga una claridad intuitiva asombrosa.',
            tipsClave: [
                'Evalúa juiciosamente cómo va tu carrera o negocio analizando datos con cabeza fría.',
                'Escucha los mensajes sutiles de tu intuición para identificar si necesitas redireccionar estrategias.',
                'Escribe en tu diario íntimo para procesar emociones y detectar qué hábitos debes soltar.',
                'REGLA DE ORO: Haz pausas con mucha frecuencia durante tu jornada laboral.'
            ],
            actividades: ['Relajate y descansa.', 'Evalua metas profesionales.', 'Analiza datos e informes de proyectos.', 'Reflexiona sobre el mes anterior.', 'Detecta áreas de tu vida que necesitan atención.', 'Identifica hábitos de los cuales prescindir.', 'Escucha la intuición para redireccionar estrategias.', 'Plantea intenciones futuras.', 'Haz pausas laborales frecuentes.']
        },
        relaciones: {
            consejoGeneral: 'El interés social y sexual disminuye naturalmente. Concédete espacios a solas para recargar pilas.',
            tipsClave: [
                '¡Usa lubricante si decides intimar! Es una fase biológicamente seca debido a las hormonas bajas.',
                'La presión física en la pelvis por el volumen del útero puede detonar deseo sexual físico en estos días.',
                'Tener relaciones con la regla libera oxitocina, eliminando el cortisol y aliviando los cólicos.'
            ],
            planesIdeales: ['Disfruta de tiempo para ti.', 'Escribe reflexiones íntimas.', 'Conversa con personas cercanas.', 'Ten una cita de descanso total.', 'Usa lubricante.']
        }
    }
};

export const ALERTAS_SINTOMAS_DIAGNOSTICOS = {
    diagnosticos: {
        miomas: {
            titulo: 'Consejos para Miomas',
            consejoGeneral: 'Amortiguar el efecto de los estrógenos, acelerar su eliminación y reducir la inflamación uterina.',
            recomendados: [
                'Consume semillas de lino.',
                'Añade soja fermentada real y legumbres limpias a tus platos.',
                'Prioriza cereales integrales ricos en fibra.',
                'Come peras y manzanas.'
            ],
            evitar: [
                'productos de soja procesados',
                'carnes rojas procesadas',
                'alimentos con fécula blanca',
                'alcohol',
                'cafeína'
            ]
        },
        endometriosis: {
            titulo: 'Consejos para Endometriosis',
            consejoGeneral: 'Enfoque en alimentación altamente antiinflamatoria y en el bloqueo de las señales de dolor.',
            recomendados: [
                'Prioriza alimentos antiinflamatorios potentes.',
                'Aumenta el consumo de magnesio.'
            ],
            evitar: [
                'lácteos',
                'alcohol',
                'gluten',
                'carne roja',
                'alimentos con pesticidas'
            ]
        },
        pmos: {
            titulo: 'Consejos para PMOS/SOP',
            consejoGeneral: 'Mejorar la sensibilidad a la insulina a través de la fibra.',
            recomendados: [
                'Consume alimentos con mucha fibra.'
            ],
            evitar: [
                'cafeína',
                'azúcar refinada',
                'edulcorantes artificiales',
                'lácteos',
                'carne roja',
                'productos de soja procesados',
                'margarina',
                'aceites vegetales refinados'
            ]
        }
    },

    // 🤒 SECCIÓN: SÍNTOMAS DEL DÍA
    sintomas: {
        menstruacionDolorosa: {
            titulo: 'Alivio de Cólicos Menstruales',
            consejoGeneral: 'Regular las prostaglandinas (hormonas del dolor) mediante nutrientes clave antes de medicar.',
            recomendados: [
                'Come almendras o avellanas.',
                'Consume verduras de hoja verde.',
                'Consume mayor cantidad de vitamina E y magnesio días antes de tu periodo.',
                'Aumenta grasas saludables.'
            ],
            evitar: [
                'lácteos',
                'grasas animales saturadas',
                'aceite de colza',
                'aceites refinados ricos en omega 6'
            ]
        },
        hinchazon: {
            titulo: 'Combate la Hinchazón',
            consejoGeneral: 'Apoyar a la microbiota para prevenir la retención de líquidos y gases.',
            recomendados: [
                'Toma probióticos y un suplemento de magnesio.',
                'Consume zumo antihinchazon: Licúa remolacha, zanahoria, apio y limón diariamente una semana antes.'
            ],
            evitar: [
                'cafeína',
                'alimentos muy salados',
                'lácteos'
            ]
        },
        acne: {
            titulo: 'Control de Acné',
            consejoGeneral: 'Regular la producción de sebo y la inflamación cutánea equilibrando vitaminas.',
            recomendados: [
                'Consume verduras de hoja verde y hortalizas de raíz.',
                'Acompaña las verduras con grasas sanas como aceite de oliva o aguacate.',
                'Añade zinc para acelerar la sanación de la piel.',
                'Aumenta los ácidos grasos esenciales.'
            ],
            evitar: [
                'productos lácteos',
                'soja',
                'cacahuetes (maní)',
                'gluten',
                'cafeína',
                'aceites vegetales refinados'
            ]
        },
        sensibilidadMamaria: {
            titulo: 'Alivio de Sensibilidad Mamaria',
            consejoGeneral: 'Calmar la inflamación que provoca la mastalgia cíclica usando antioxidantes potentes.',
            recomendados: [
                'Aumenta el consumo de vitamina E.',
                'Toma aceite de prímula.'
            ],
            evitar: []
        }
    }
};