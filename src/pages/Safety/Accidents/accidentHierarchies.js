export const ACCIDENT_HIERARCHY = [
  {
    code: "C.2.1",
    name: "Laboral",
    children: [
      {
        code: "C.2.1.1",
        name: "En el curso del trabajo (CT)",
        children: [
          {
            code: "C.2.1.1.a",
            name: "Bajo protocolo o procedimiento de trabajo (BPT)",
            children: [
              { code: "BPT-M", name: "Mantenimiento" },
              { code: "BPT-O", name: "Operativo" },
              { code: "BPT-AR", name: "Avería o reclamo" },
            ],
          },
          {
            code: "C.2.1.1.b",
            name: "Sin protocolo o procedimiento de trabajo (SPPT)",
          },
          {
            code: "C.2.1.1.c",
            name: "Protocolo de Atención de Incidente (PAI) (Prevención o atención)",
          },
          {
            code: "C.2.1.1.d",
            name: "En trayecto laboral (ETRA)",
          },
        ],
      },
      {
        code: "C.2.1.2",
        name: "En ocasión del trabajo (OC)",
        children: [
          {
            code: "C.2.1.2.a",
            name: "Actividades Especiales (AE)",
            children: [
              { code: "AE-F", name: "Formación asignada por el patrono" },
              {
                code: "AE-D",
                name: "Deportivas en representación del patrono",
              },
              {
                code: "AE-CS",
                name: "Desempeño de cargos electivos sindicales",
              },
            ],
          },
          {
            code: "C.2.1.2.b",
            name: "Trayecto Itínere (I)",
            children: [
              {
                code: "I-AE",
                name: "En actividades especiales",
                children: [
                  {
                    code: "I-AE-F",
                    name: "Hacia y desde la actividad de formación asignada",
                  },
                  {
                    code: "I-AE-D",
                    name: "Hacia y desde la actividad deportiva asignada",
                  },
                  {
                    code: "I-AE-CS",
                    name: "Hacia y desde la actividad sindical desempeñada",
                  },
                  {
                    code: "I-AE-P",
                    name: "En actividades especiales asignadas por el patrono",
                  },
                ],
              },
              {
                code: "I-RC",
                name: "Para el inicio o por terminación de la Jornada de trabajo (Residencia ↔ Centro de Trabajo)",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "C.2.2",
    name: "Incidentes No Laborales",
    children: [
      {
        code: "C.2.2.1",
        name: "Fuera del curso u ocasión de trabajo (FCOT)",
        children: [
          { code: "FCOT-DJT", name: "Dentro de la jornada laboral" },
          { code: "FCOT-FJT", name: "Fuera de la jornada laboral" },
        ],
      },
      {
        code: "C.2.2.2",
        name: "Condición o estado patológico no laboral (CPNL)",
        children: [
          { code: "CPNL-TN", name: "Trastorno neurológico" },
          { code: "CPNL-TC", name: "Trastorno cardíaco" },
          { code: "CPNL-TCI", name: "Trastorno circulatorio" },
          { code: "CPNL-TR", name: "Trastorno respiratorio" },
          { code: "CPNL-TE", name: "Trastorno endocrinos" },
          { code: "CPNL-TG", name: "Trastorno gastrointestinales" },
          { code: "CPNL-TRE", name: "Trastorno renal" },
          { code: "CPNL-NC", name: "No clasificado" },
        ],
      },
    ],
  },
  {
    code: "C.2.3",
    name: "Terceros Relacionados",
    children: [
      {
        code: "C.2.3.1",
        name: "Actividades inherentes o conexas (AIC)",
        children: [
          { code: "AIC-L", name: "Laboral" },
          { code: "AIC-O", name: "Operacional" },
        ],
      },
      {
        code: "C.2.3.2",
        name: "Actividades no inherentes o conexas (NAIC)",
        children: [
          { code: "NAIC-L", name: "Laboral" },
          { code: "NAIC-O", name: "Operacional" },
        ],
      },
    ],
  },
  {
    code: "C.2.4",
    name: "Tercero No Relacionado",
    children: [
      {
        code: "C.2.4.1",
        name: "Actividades dentro de la zona de seguridad (ADZS)",
        children: [
          { code: "ADZS-OFN", name: "Ocupación fuera de norma" },
          { code: "ADZS-AFN", name: "Actividades fuera de norma" },
          { code: "ADZS-TC", name: "Trabajo de construcción y similares" },
          { code: "ADZS-VP", name: "Vuelo de papagayo y otros juegos" },
          { code: "ADZS-RF", name: "Recolección de frutas" },
          { code: "ADZS-VDS", name: "Vencimiento distancia de seguridad" },
          { code: "ADZS-FE", name: "Falla estructural" },
          { code: "CPNL-NC", name: "No clasificado" },
        ],
      },
      {
        code: "C.2.4.2",
        name: "Conexión o manipulación no autorizada del sistema eléctrico (CMNA)",
      },
      {
        code: "C.2.4.3",
        name: "Hurto de activos del sistema eléctrico (HASE)",
      },
    ],
  },
  {
    code: "C.2.5",
    name: "Operacional",
    children: [
      { code: "C.2.5.1", name: "Elemento estructural (EE)" },
      { code: "C.2.5.2", name: "Elemento operacional / de equipo (EO)" },
      {
        code: "C.2.5.3",
        name: "Elemento exógeno",
        children: [
          { code: "C.2.5.3.a", name: "Antrópico" },
          { code: "C.2.5.3.b", name: "Ambiental" },
        ],
      },
    ],
  },
  {
    code: "C.2.6",
    name: "Traslado / Tránsito (TR)",
    children: [
      { code: "C.2.6.1", name: "Terrestre (vehículo / moto / semoviente)" },
      { code: "C.2.6.2", name: "Acuático (bote, canoa, lancha)" },
      { code: "C.2.6.3", name: "Aéreo (avión / avioneta / helicóptero)" },
    ],
  },
  {
    code: "C.2.7",
    name: "Ambiental",
    children: [
      { code: "C.2.7.1", name: "Geológico (G)" },
      { code: "C.2.7.2", name: "Hidrometeorológico (HM)" },
      { code: "C.2.7.3", name: "Atmosférico (AT)" },
    ],
  },
];

export const HAZARD_HIERARCHY = [
  {
    code: "C.4.1",
    name: "AGENTE / ELEMENTO",
    children: [
      {
        code: "C.4.1.1",
        name: "Físico Elemento",
        children: [
          {
            code: "C.4.1.1.a",
            name: "Fogonazo eléctrico o “electrical flashover” (temperatura extrema / presión anormal)",
          },
          {
            code: "C.4.1.1.b",
            name: "Electricidad (contacto directo o indirecto)",
            children: [
              {
                code: "C.4.1.1.b-BT",
                name: "Baja Tensión (desde 0,1 V hasta 1.500 V)",
              },
              {
                code: "C.4.1.1.b-MT",
                name: "Media Tensión (desde 1.500 V hasta 69,9 kV)",
              },
              {
                code: "C.4.1.1.b-AT",
                name: "Alta Tensión (desde 69,9 kV hasta 750 kV)",
              },
            ],
          },
          {
            code: "C.4.1.1.c",
            name: "Iluminación y ambiente cromático (vislumbrante / deslumbrante)",
          },
          { code: "C.4.1.1.d", name: "Presiones anormales" },
          { code: "C.4.1.1.e", name: "Radiaciones Ionizantes" },
          { code: "C.4.1.1.f", name: "Radiaciones no Ionizantes" },
          { code: "C.4.1.1.g", name: "Ruido" },
          { code: "C.4.1.1.h", name: "Temperaturas extremas (calor / frío)" },
          { code: "C.4.1.1.i", name: "Vibraciones" },
        ],
      },
      {
        code: "C.4.1.2",
        name: "Mecánico Elemento",
        children: [
          { code: "C.4.1.2.a", name: "Desnivel" },
          { code: "C.4.1.2.b", name: "Elemento abrasivo" },
          { code: "C.4.1.2.c", name: "Elemento en movimiento" },
          { code: "C.4.1.2.d", name: "Elemento estático" },
          { code: "C.4.1.2.e", name: "Elemento fijo" },
          { code: "C.4.1.2.f", name: "Elemento filoso" },
          { code: "C.4.1.2.g", name: "Elemento punzante" },
          { code: "C.4.1.2.h", name: "Elemento cortante" },
          { code: "C.4.1.2.i", name: "Elemento contuso" },
          {
            code: "C.4.1.2.j",
            name: "Elementos o superficies irregulares o resbaladizos",
          },
        ],
      },
      {
        code: "C.4.1.3",
        name: "Químico Elemento",
        children: [
          { code: "C.4.1.3.a", name: "Ausencia o exceso de oxígeno" },
          { code: "C.4.1.3.b", name: "Elementos cancerígenos" },
          { code: "C.4.1.3.c", name: "Elementos corrosivos" },
          { code: "C.4.1.3.d", name: "Elementos inflamables" },
          { code: "C.4.1.3.e", name: "Elementos tóxicos" },
          { code: "C.4.1.3.f", name: "Elementos irritantes" },
          { code: "C.4.1.3.g", name: "Elementos explosivos" },
          { code: "C.4.1.3.h", name: "Elementos radiactivos" },
        ],
      },
      {
        code: "C.4.1.4",
        name: "Biológico Elemento",
        children: [
          { code: "C.4.1.4.a", name: "Animales (reptiles, mamíferos, aves)" },
          {
            code: "C.4.1.4.b",
            name: "Bacterias, virus, hongos, esporas y parásitos",
          },
          { code: "C.4.1.4.c", name: "Fluidos corporales" },
          { code: "C.4.1.4.d", name: "Insectos (avispas, abejas, artrópodos)" },
          { code: "C.4.1.4.e", name: "Vegetación" },
        ],
      },
    ],
  },
  {
    code: "C.4.2",
    name: "CONDICIÓN / ELEMENTO",
    children: [
      {
        code: "C.4.2.1",
        name: "Psicosocial Elemento",
        children: [
          {
            code: "C.4.2.1.a",
            name: "Comportamiento no responsable / práctica inadecuada",
            children: [
              { code: "C.4.2.1.a-P", name: "Propio" },
              { code: "C.4.2.1.a-AT", name: "Actos de terceros" },
            ],
          },
          { code: "C.4.2.1.b", name: "Relaciones interpersonales inadecuadas" },
          { code: "C.4.2.1.c", name: "Ritmo de trabajo inadecuado" },
          { code: "C.4.2.1.d", name: "Sobrecarga mental" },
          { code: "C.4.2.1.e", name: "Manejo de multitudes" },
        ],
      },
      {
        code: "C.4.2.2",
        name: "Disergonómica Elemento",
        children: [
          {
            code: "C.4.2.2.a",
            name: "Espacios de trabajo, mobiliarios y herramientas",
          },
          { code: "C.4.2.2.b", name: "Movimientos repetitivos o violentos" },
          { code: "C.4.2.2.c", name: "Posiciones o posturas" },
          { code: "C.4.2.2.d", name: "Sobrecarga o esfuerzo físico" },
        ],
      },
      {
        code: "C.4.2.3",
        name: "Protocolo o procedimiento de trabajo Elemento",
        children: [
          {
            code: "C.4.2.3.a",
            name: "Intervención de instalaciones en un área restringida.",
          },
          {
            code: "C.4.2.3.b",
            name: "Trabajo en equipos o líneas energizadas.",
          },
          {
            code: "C.4.2.3.c",
            name: "Trabajo en equipos o líneas no energizadas.",
          },
          {
            code: "C.4.2.3.d",
            name: "Trabajo en altura (andamios, escaleras, guindolas).",
          },
          { code: "C.4.2.3.e", name: "Trabajo en espacios confinados." },
          { code: "C.4.2.3.f", name: "Trabajo en Atmósfera Peligrosa." },
          {
            code: "C.4.2.3.g",
            name: "Trabajo con fuentes de radiaciones ionizantes y no ionizantes.",
          },
          { code: "C.4.2.3.h", name: "Trabajo en cuerpos líquidos." },
          {
            code: "C.4.2.3.i",
            name: "Trabajos subacuáticos y en superficies acuáticas.",
          },
          { code: "C.4.2.3.j", name: "Trabajo en áreas compartidas." },
          { code: "C.4.2.3.k", name: "Excavación." },
          { code: "C.4.2.3.l", name: "Izamiento de carga." },
          {
            code: "C.4.2.3.m",
            name: "Operaciones aerotransportadas / fluviales / terrestres.",
          },
          {
            code: "C.4.2.3.n",
            name: "Trabajo de desmalezamiento dentro de zona de seguridad.",
          },
        ],
      },
      {
        code: "C.4.2.4",
        name: "Operacional Elemento",
        children: [
          { code: "C.4.2.4.a", name: "Explosión / implosión" },
          { code: "C.4.2.4.b", name: "Incendio" },
          {
            code: "C.4.2.4.c",
            name: "Falla estructural",
            children: [
              {
                code: "EE-LE",
                name: "Tendido eléctrico, torre, poste, entre otros componentes (EE-LE)",
              },
              {
                code: "EE-SE",
                name: "Subestación (pórticos, transformador, entre otros) (EE-SE)",
              },
              {
                code: "EE-ES",
                name: "Estructura operativa (caldera, planta tratamiento, turbina, generador, pórtico salida, entre otros) (EE-ES)",
              },
              {
                code: "EE-EQP",
                name: "Equipos pesados (grúas, vaccum, cisterna, entre otros) (EE-EQP)",
              },
              {
                code: "EE_EQ",
                name: "Equipos (bombas, señoritas, entre otros) (EE_EQ)",
              },
              {
                code: "EE",
                name: "Estructura apoyo (edificaciones, sótanos, casetas, almacenamiento de equipos en operación, vialidad) (EE)",
              },
            ],
          },
          {
            code: "C.4.2.4.d",
            name: "Falla de equipos / proceso",
            children: [
              {
                code: "EO-PF",
                name: "Pérdida de función (no opera, operation parcial) (EO-PF)",
              },
              {
                code: "EO-OP",
                name: "Operación prematura (accionamiento sin demanda) (EO-OP)",
              },
              {
                code: "EO-CFR",
                name: "Condición fuera de rango de tolerancia (EO-CFR)",
              },
              {
                code: "EO-CFA",
                name: "Condición física anormal observada (EO-CFA)",
              },
              {
                code: "EO-CPIFN",
                name: "Condición o práctica inadecuada / fuera de norma (EO-CPIFN)",
              },
            ],
          },
          {
            code: "C.4.2.4.e",
            name: "Liberación de materiales, sustancias, residuos o desechos peligrosos",
            children: [
              { code: "C.4.2.4.e-EXP", name: "Explosivos" },
              { code: "C.4.2.4.e-GAS", name: "Gases" },
              {
                code: "C.4.2.4.e-LIF",
                name: "Líquidos inflamables y combustibles",
              },
              { code: "C.4.2.4.e-SOF", name: "Sólidos inflamables" },
              { code: "C.4.2.4.e-OXI", name: "Oxidantes" },
              {
                code: "C.4.2.4.e-TOX",
                name: "Tóxicos, infecciosos o venenosos",
              },
              { code: "C.4.2.4.e-RAD", name: "Materiales radiactivos" },
              { code: "C.4.2.4.e-COR", name: "Corrosivos" },
              { code: "C.4.2.4.e-MIS", name: "Misceláneos" },
            ],
          },
          {
            code: "C.4.2.4.f",
            name: "Liberación de emisiones o efluentes fuera de norma",
          },
          {
            code: "C.4.2.4.g",
            name: "Comportamiento no responsable / práctica inadecuada",
          },
        ],
      },
      {
        code: "C.4.2.5",
        name: "Traslado / Tránsito (TR) (Acuático, Aéreo, Terrestre)",
        children: [
          { code: "V-C", name: "Colisionar (V-C)" },
          { code: "V-VO", name: "Volcar / hundir / encunetar (V-VO)" },
          { code: "V-DM", name: "Desperfecto mecánico (V-DM)" },
          { code: "V-P", name: "Pinchar (V-P)" },
          { code: "V-A", name: "Arrollar (V-A)" },
          { code: "V-NC", name: "No clasificado (V-NC)" },
        ],
      },
      {
        code: "C.4.2.6",
        name: "Ambiental Elemento",
        children: [
          {
            code: "C.4.2.6.a",
            name: "Geológico",
            children: [
              { code: "C.4.2.6.a-AV", name: "Actividad volcánica" },
              {
                code: "C.4.2.6.a-MS",
                name: "Movimientos en suelo / masa (deslizamientos, derrumbes, flujo de detritos, reptación, asentamientos)",
              },
              {
                code: "C.4.2.6.a-S",
                name: "Sismos (terremoto / maremoto / tsunami)",
              },
            ],
          },
          {
            code: "C.4.2.6.b",
            name: "Hidrometeorológico",
            children: [
              {
                code: "C.4.2.6.b-LL",
                name: "Lluvias (débiles, moderadas, fuertes)",
              },
              { code: "C.4.2.6.b-MF", name: "Mar de fondo o leva" },
              { code: "C.4.2.6.b-T", name: "Tormentas" },
              { code: "C.4.2.6.b-CI", name: "Crecida / inundación" },
              { code: "C.4.2.6.b-O", name: "Oleaje" },
            ],
          },
          {
            code: "C.4.2.6.c",
            name: "Atmosférico",
            children: [
              { code: "C.4.2.6.c-DE", name: "Descargas eléctricas" },
              { code: "C.4.2.6.c-H", name: "Huracanes" },
              {
                code: "C.4.2.6.c-IF",
                name: "Incendio forestal o de vegetación por descomposición orgánica",
              },
              { code: "C.4.2.6.c-M", name: "Microburst" },
              { code: "C.4.2.6.c-RV", name: "Ráfagas de vientos" },
              {
                code: "C.4.2.6.c-TE",
                name: "Temperatura extrema (calor / frío)",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "C.4.3",
    name: "Exógeno Antrópico",
    children: [
      {
        code: "C.4.3.1.a",
        name: "Incendio forestal o de vegetación intencional / quema de cultivo",
      },
      { code: "C.4.3.1.b", name: "Incidente operacional de terceros" },
      { code: "C.4.3.1.c", name: "Emisiones / polución a la atmósfera" },
      {
        code: "C.4.3.1.d",
        name: "Liberación de materiales, sustancias, residuos o desechos",
      },
      {
        code: "C.4.3.1.e",
        name: "Actividades de tercero dentro de la zona de seguridad",
      },
      {
        code: "C.4.3.1.f",
        name: "Conexión o manipulación no autorizada del sistema eléctrico",
      },
      { code: "C.4.3.1.g", name: "Hurto de activos del sistema eléctrico" },
      { code: "C.4.3.1.h", name: "Robo" },
      { code: "C.4.3.1.i", name: "Vandalismo / saqueo" },
      { code: "C.4.3.1.j", name: "Agresión" },
      {
        code: "C.4.3.1.k",
        name: "Comportamiento irresponsable / inadecuado de tercero",
      },
    ],
  },
];

export const CONTACT_EXPOSURE_HIERARCHY = [
  {
    code: "C.5.1",
    name: "Golpeado",
    children: [
      { code: "C.5.1.1", name: "Contra" },
      { code: "C.5.1.2", name: "Por" },
    ],
  },
  {
    code: "C.5.2",
    name: "Atrapado",
    children: [
      { code: "C.5.2.1", name: "Debajo" },
      { code: "C.5.2.2", name: "En" },
      { code: "C.5.2.3", name: "Entre" },
      { code: "C.5.2.4", name: "Por" },
    ],
  },
  {
    code: "C.5.3",
    name: "Contacto con",
    children: [
      {
        code: "C.5.3.1",
        name: "Elementos físicos",
        children: [
          { code: "C.5.3.1.a", name: "Electricidad" },
          { code: "C.5.3.1.b", name: "Iluminación excesiva (deslumbramiento)" },
          { code: "C.5.3.1.c", name: "Presión, Vacío (excluye por explosión)" },
          { code: "C.5.3.1.d", name: "Radiación ionizante" },
          { code: "C.5.3.1.e", name: "Radiación no ionizante" },
          {
            code: "C.5.3.1.f",
            name: "Ruido por encima de los niveles permisibles (excluye por explosión)",
          },
          { code: "C.5.3.1.g", name: "Temperatura extrema (calor o frío)" },
          { code: "C.5.3.1.h", name: "Vibración extrema" },
        ],
      },
      {
        code: "C.5.3.2",
        name: "Elementos mecánicos",
        children: [
          { code: "C.5.3.2.a", name: "Abrasivo" },
          { code: "C.5.3.2.b", name: "Filoso o cortante" },
          { code: "C.5.3.2.c", name: "Punzante" },
          { code: "C.5.3.2.d", name: "Contuso" },
        ],
      },
      {
        code: "C.5.3.3",
        name: "Elementos químicos",
        children: [
          { code: "C.5.3.3.a", name: "Cancerígenos" },
          { code: "C.5.3.3.b", name: "Corrosivos" },
          { code: "C.5.3.3.c", name: "Irritantes" },
          { code: "C.5.3.3.d", name: "Tóxico" },
        ],
      },
      {
        code: "C.5.3.4",
        name: "Elementos biológicos",
        children: [
          {
            code: "C.5.3.4.a",
            name: "Animales e insectos",
            children: [
              { code: "C.5.3.4.a-INO", name: "Inoculación" },
              { code: "C.5.3.4.a-MOR", name: "Mordedura" },
              { code: "C.5.3.4.a-PIC", name: "Picadura" },
              {
                code: "C.5.3.4.a-AGR",
                name: "Agresión (Golpe, patada, cabezazo, estrangulamiento)",
              },
            ],
          },
          {
            code: "C.5.3.4.b",
            name: "Vegetación",
            children: [
              { code: "C.5.3.4.b-COR", name: "Cortante" },
              { code: "C.5.3.4.b-PUN", name: "Punzante" },
              { code: "C.5.3.4.b-URT", name: "Urticante" },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "C.5.4",
    name: "Caída",
    children: [
      {
        code: "C.5.4.1",
        name: "Por Nivel",
        children: [
          { code: "C.5.4.1.a", name: "De diferente nivel" },
          { code: "C.5.4.1.b", name: "De un mismo nivel" },
        ],
      },
      {
        code: "C.5.4.2",
        name: "De objetos",
        children: [
          { code: "C.5.4.2.a", name: "Árboles / ramas" },
          { code: "C.5.4.2.b", name: "Piedra" },
          { code: "C.5.4.2.c", name: "Postes" },
          { code: "C.5.4.2.d", name: "Tierra" },
          { code: "C.5.4.2.e", name: "Herramientas" },
          { code: "C.5.4.2.f", name: "Cargas izadas" },
          { code: "C.5.4.2.g", name: "Componentes / herraje" },
        ],
      },
    ],
  },
  {
    code: "C.5.5",
    name: "Colisión con",
    children: [
      { code: "C.5.5.1", name: "Persona" },
      { code: "C.5.5.2", name: "Objeto fijo" },
      { code: "C.5.5.3", name: "Objeto en movimiento" },
      { code: "C.5.5.4", name: "Animales" },
    ],
  },
  {
    code: "C.5.6",
    name: "Pisar sobre",
    children: [
      { code: "C.5.6.1", name: "Objeto" },
      { code: "C.5.6.2", name: "Superficie o suelo irregular" },
      { code: "C.5.6.3", name: "Superficie o suelo resbaladizo" },
      { code: "C.5.6.4", name: "Superficie inestable / débil" },
      { code: "C.5.6.5", name: "Sustancia" },
      { code: "C.5.6.6", name: "Pavimento resbaladizo o irregular" },
      { code: "C.5.6.7", name: "Pendiente o curva peligrosa" },
    ],
  },
  {
    code: "C.5.7",
    name: "Envuelto por",
    children: [
      {
        code: "C.5.7.1",
        name: "Atmósfera peligrosa",
        children: [
          { code: "C.5.7.1.a", name: "Deficiencia de oxígeno" },
          { code: "C.5.7.1.b", name: "Exceso de oxígeno" },
          { code: "C.5.7.1.c", name: "Gas o vapor" },
          { code: "C.5.7.1.d", name: "Niebla / humo" },
          { code: "C.5.7.1.e", name: "Emisión fuera de norma" },
        ],
      },
      {
        code: "C.5.7.2",
        name: "Líquido",
        children: [
          { code: "C.5.7.2.a", name: "Cuerpo de agua" },
          { code: "C.5.7.2.b", name: "Sustancia química" },
        ],
      },
      { code: "C.5.7.3", name: "Sólidos en suspensión" },
    ],
  },
  {
    code: "C.5.8",
    name: "Exposición a",
    children: [
      {
        code: "C.5.8.1",
        name: "Presión",
        children: [
          { code: "C.5.8.1.a", name: "Presión anormal (fuera de tolerancia)" },
          { code: "C.5.8.1.b", name: "Sobrepresión o vacío (en forma súbita)" },
        ],
      },
      {
        code: "C.5.8.2",
        name: "Agentes biológicos",
        children: [
          { code: "C.5.8.2.a", name: "Bacterias" },
          { code: "C.5.8.2.b", name: "Esporas" },
          { code: "C.5.8.2.c", name: "Hongos" },
          { code: "C.5.8.2.d", name: "Parásitos" },
          { code: "C.5.8.2.e", name: "Virus" },
          { code: "C.5.8.2.f", name: "Fluidos corporales" },
        ],
      },
      {
        code: "C.5.8.3",
        name: "Factores Psicosociales",
        children: [
          { code: "C.5.8.3.a", name: "Agresión" },
          { code: "C.5.8.3.b", name: "Actos delictivos" },
          { code: "C.5.8.3.c", name: "Conflictos sociales" },
          { code: "C.5.8.3.d", name: "Acoso (laboral / sexual)" },
          {
            code: "C.5.8.3.e",
            name: "Factores Personales (problemas familiares, motivación, etc.)",
          },
        ],
      },
    ],
  },
  {
    code: "C.5.9",
    name: "Otra forma no clasificada",
  },
];

export const AFFECTATION_CLASS_HIERARCHY = [
  {
    code: "C.7.1",
    name: "CLASE A: Incidente Sin Afectación",
  },
  {
    code: "C.7.2",
    name: "CLASE B: Incidente Con Afectación o Daño",
    children: [
      {
        code: "C.7.2.1",
        name: "Laboral",
        children: [
          { code: "A.1.1", name: "Incidente con lesión" },
          { code: "A.1.2", name: "Incidente con fatalidad" },
          { code: "A.1.3", name: "Incidente por enfermedad" },
        ],
      },
      {
        code: "C.7.2.2",
        name: "Terceros Relacionados",
        children: [
          { code: "A.1.3.1", name: "Incidente con lesión" },
          { code: "A.1.3.2", name: "Incidente con fatalidad" },
          { code: "A.1.3.3", name: "Incidente con afectación de activos" },
        ],
      },
      {
        code: "C.7.2.3",
        name: "Incidentes No Laborales",
        children: [
          { code: "A.1.3.4", name: "Enfermedad no ocupacional" },
          {
            code: "A.1.3.5",
            name: "Afectación de activos / servicio eléctrico",
          },
        ],
      },
      {
        code: "C.7.2.4",
        name: "Terceros No Relacionados",
        children: [
          { code: "A.1.3.6", name: "Incidente con lesión" },
          { code: "A.1.3.7", name: "Incidente con fatalidad" },
          {
            code: "A.1.3.8",
            name: "Incidente con afectación de activos / servicio eléctrico",
          },
        ],
      },
      {
        code: "C.7.2.5",
        name: "Operacional",
        children: [
          { code: "A.1.4", name: "Incidente con afectación al proceso" },
          { code: "A.1.5", name: "Incidente con daño a bienes" },
        ],
      },
      {
        code: "C.7.2.6",
        name: "Ambiental",
        children: [
          { code: "A.1.6", name: "Daño a suelos" },
          { code: "A.1.7", name: "Daño a cuerpo de agua" },
          { code: "A.1.8", name: "Daño a vegetación" },
          { code: "A.1.9", name: "Daño a fauna" },
          { code: "A.1.10", name: "Daño a la atmósfera" },
          { code: "A.1.11", name: "Daño al paisaje" },
        ],
      },
      {
        code: "C.7.2.7",
        name: "Desviación o Incumplimiento del Marco Regulatorio",
        children: [
          { code: "A.1.12", name: "Ley Nacional" },
          { code: "A.1.13", name: "Norma técnica Nacional" },
          { code: "A.1.14", name: "Norma técnica Internacional" },
          { code: "A.1.15", name: "Documento interno" },
        ],
      },
    ],
  },
];

export const AFFECTATION_SUBJECT_HIERARCHY = [
  {
    code: "C.8.1",
    name: "Personas",
    children: [
      { code: "C.8.1.1", name: "Trabajador(a) fijo(a)" },
      { code: "C.8.1.2", name: "Trabajador(a) eventual" },
      { code: "C.8.1.3", name: "Tercero relacionado" },
      { code: "C.8.1.4", name: "Terceros no relacionado" },
    ],
  },
  {
    code: "C.8.2",
    name: "Bienes o activos",
    children: [
      {
        code: "C.8.2.1",
        name: "Instalaciones, sistemas, servicios y/o equipos principales (Turbinas, generadores, transformadores, etc.)",
      },
      {
        code: "C.8.2.2",
        name: "Instalaciones, sistemas, servicios y/o equipos auxiliares (Servicios combustible/agua, medición, etc.)",
      },
      {
        code: "C.8.2.3",
        name: "Instalaciones, sistemas, servicios y/o equipos de apoyo (Almacenes, comunicaciones, talleres, etc.)",
      },
      { code: "C.8.2.4", name: "Materiales e insumos." },
      { code: "C.8.2.5", name: "Piezas, partes, productos o sustancias." },
      {
        code: "C.8.2.6",
        name: "Instalaciones, materiales, equipos, procesos.",
      },
      { code: "C.8.2.7", name: "Semovientes." },
      { code: "C.8.2.8", name: "Bienes de terceros." },
      { code: "C.8.2.9", name: "Vehículos / motos." },
      { code: "C.8.2.10", name: "Vehículos especiales." },
      { code: "C.8.2.11", name: "Vehículos pesados." },
    ],
  },
  {
    code: "C.8.3",
    name: "Procesos",
    children: [
      { code: "C.8.3.1", name: "Generación" },
      { code: "C.8.3.2", name: "Transmisión" },
      { code: "C.8.3.3", name: "Distribución" },
      { code: "C.8.3.4", name: "Comercialización" },
      {
        code: "C.8.3.5",
        name: "Transversales (Bienes y Servicios, Automatización, ATIT, ASHO, etc.)",
      },
    ],
  },
  {
    code: "C.8.4",
    name: "Ambiente",
    children: [
      { code: "C.8.4.1", name: "Suelo" },
      { code: "C.8.4.2", name: "Vegetación" },
      { code: "C.8.4.3", name: "Fauna" },
      { code: "C.8.4.4", name: "Aguas" },
      { code: "C.8.4.5", name: "Atmósfera" },
    ],
  },
];
