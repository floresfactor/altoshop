import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, Affix } from 'antd';
import ServicesModal from './servicesModal.jsx';
import ServiceIndex from './serviceIndex.jsx';
import VideoModal from './videoModal.jsx';


const allquiz = [
  { name: 'depilacion',
    quiz: 
    [{ 
      question: '¿Cuál es la diferencia entre luz pulsada y láser?',
      answer:
        <div>
          <p>El láser es una tecnología que cada día cobra mayor importancia ya que es capaz de lograr una depilación permanente, es decir, logra que el crecimiento del vello se elimine o se reduzca completamente durante el tratamiento.</p>
          <p>Entre los métodos tecnológicos más utilizados para la depilación permanente se encuentran el láser (luz amplificada para estimulación y emisión de radiación) y el IPL (luz pulsada intensa). Estos dos métodos comparten una misma tecnología base que es la fotodepilación, la cual se refiere a la depilación a través de energía generada por la luz; esta energía es absorbida por el vello, impidiendo así su creación. Sin embargo, existen ciertas diferencias en las propiedades que ocasionan reacciones y resultados muy diferentes en el cuerpo. </p>
          <p>Adicionalmente debes saber que durante los tratamientos de láser, la piel debe ser perfectamente refrigerada y protegida. El sistema DCD (Dispositivo de Enfriamiento Dinámico)  que está patentado por CANDELA (la marca de equipos láser MÁS reconocida internacionalmente), ofrece un uniforme método de refrigeración, es muy seguro y eficaz y es muy importante ya que permite una protección óptima de la dermis, con esto, se protege la superficie y las estructuras de la piel entre los folículos pilosos, puesto que refrigera selectivamente las capas superiores de la piel con una pulverización de cryógeno (espray frío), milisegundos antes de la pulsión del láser, este sistema, además de proteger la piel y reducir el dolor, permite la utilización de energías más altas para unos resultados más efectivos sin riesgos en tu piel. </p>
          <p>A largo plazo el láser resulta una mejor y más económica opción ya que se logran mejores resultados con menos sesiones. Vello que te elimina no vuelve a salir. Los beneficios del láser también se pueden apreciar en otros tratamientos como várices y tratamientos de rejuvenecimiento facial.</p>
          <p>En  kopay estarás en las mejores manos gracias a sus equipos láser y a la experiencia que los respalda con más de 100,000 mil clientas satisfechas.</p>
          <p>Gracias a KOPAY, los tratamientos con LÁSER están hoy disponibles para todos y para todo tipo de piel, de una manera rápida, efectiva, cómoda, económica y sin dolor.</p>
          <table className="depilation-table" >
            <thead>
              <tr>
                <th>Láser</th>
                <th>IPL(Luz Pulsada)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Llega al folículo del vello</td>
                <td>Detecta solo el vello sin llegar al folículo</td>
              </tr>
              <tr>
                <td>Desintegra el vello desde la raíz</td>
                <td>No desintegra el vello desde raíz</td>
              </tr>
              <tr>
                <td>Energía en una sola diracción directa al folículo (unidireccional) y con un solo haz (coherencia).</td>
                <td>Energía sin sentido determinado ni controlado.</td>
              </tr>
              <tr>
                <td>Menor número de sesiones</td>
                <td>Mayor número de sesiones</td>
              </tr>
              <tr>
                <td>Sistema de enfriamiento(protección a la piel)</td>
                <td>Sin sistema de enfriamiento</td>
              </tr>
            </tbody>
          </table>
      </div>
      }
    ,{
      question: '¿Qué tipos de láser utilizan en la depilación?',
      answer: 
        <div>
          <p>En depilación existen muchos tipos de LÁSER, pero han ido evolucionando día a día, el más avanzado que existe actualmente en el mercado mundial es el LÁSER de YAG, el cual es utilizado en KOPAY, es para todo tipo de piel, y no produce ningún efecto ni riesgo secundario.</p>
          <div className="laser-type" >
            <img src='/public/img/respuesta2.jpg' alt="depilacion" className="img-responsive" />
          </div>
        </div>
    },
    {
      question:'¿Cuántas sesiones necesito?',
      answer: 
        <div>
          <p>Hay muchos factores que influyen en la eliminación del vello tales como la edad, la condición de la piel, el grosor del vello, el metabolismo, la genética, lo fuerte del folículo del vello, problemas hormonales, el organismo de cada persona, la etapa en que se encuentre el crecimiento del vello, etc. Y como todas las personas somos diferentes es muy difícil recomendar un número de sesiones en las cuales se eliminará el vello por completo ya que eso puede depender de todos los factores antes mencionados.</p>
          <p>Lo que sí es un hecho es que, EN LA MAYORÍA DE LOS CASOS, entre más grueso sea el vello será más rápida la eliminación. Además es importante mencionar que todos los folículos al momento de aplicar una sesión de terapia láser, se encuentran en diferentes etapas de crecimiento.</p>
        </div>
    },{
      question: '¿Cuál es la edad ideal para depilarse con láser?',
      answer: 
        <div>
          <p>La edad ideal es cuando el paciente sienta la inquietud y tenga el convencimiento de que desea realizarse un tratamiento de depilación láser. Tenemos niñas de todas las edades, en donde el tratamiento es igual de efectivo, aquí lo importante es que el paciente vaya convencido de quererse eliminar el vello.</p>
          <p>Es muy importante que en caso de que el paciente sea menor de edad el consentimiento sea firmado por los padres o el tutor del menor y que al momento de que se le aplique el tratamiento sea acompañado en la cabina de alguna persona de su confianza mayor de edad.</p>
        </div>
    },{
      question: '¿Tiene efectos secundarios?',
      answer: 
        <p>Ninguno, ya que es una luz selectiva que sólo trabaja en la primera capa de la piel. Los riesgos son mínimos, en muy pocos casos hay enrojecimiento de la piel, que se te quitará pocos minutos después del tratamiento. El LÁSER que utiliza KOPAY no te produce ni tiene ningún efecto secundario, además es el más efectivo, utilizado y recomendado para este tipo de tratamientos.</p>
    },{
      question: '¿Cómo funciona?',
      answer: 
          <p>
            Contamos con el mejor equipo láser reconocido mundialmente que te ofrece la más avanzada tecnología del mercado. Los resultados son excepcionales y sorprendentes. Es un láser muy fácil de operar, así que los errores humanos se reducen al mínimo.
          </p>,
      videoSrc: 'https://www.youtube.com/embed/haG7isWaIW4'
    },{
      question: '¿Es doloroso?',
      answer: 
        <p>Algunos pacientes pueden sentir cierta molestia con el impulso del láser. Esta molestia se quita en cuestión de segundos y es minimizada por el sistema de enfriamiento DCD del aparato. También es importante mencionar que la molestia depende de la sensibilidad de cada persona y el área a tratar, por lo que unas personas sienten menos molestia que otras..</p>  
    },{
      question: '¿En cuánto tiempo se ven los resultados?',
      answer: 
      <p>
        'Los resultados comienzan a hacer efecto desde el momento que se aplica el tratamiento, sólo que no son visibles a simple vista ya que trabaja en los tejidos de la piel. Pero la mayoría de las personas manifiestan notar los resultados desde las primeras sesiones.
      </p>
    }]
  },
  { name: 'antiedad',
    quiz: [
      { question: '¿Cuántas sesiones necesito?',
        answer:
          <div>
            <p>Muchos factores pueden impactar la eficacia del tratamiento láser, incluyendo la severidad del caso que se va a tratar. El número de sesiones requeridas dependerá de las condiciones de tu piel, notando cambios desde la primera cita.</p>
            <p>Las sesiones recomendadas para lograr un resultado óptimo son:</p>
            <p>5 sesiones, una sesión cada 3 semanas.</p>
            <p>Después una cada 3 a 6 meses según sienta el paciente la necesidad.</p>
          </div>
      },{
        question: '¿Tiene efectos secundarios?',
        answer: 
          <p>Ninguno, ya que el LÁSER es una luz selectiva que sólo trabaja en la primera capa de la piel. Los riesgos son mínimos, en muy pocos casos hay enrojecimiento de la piel, que se te quitará pocos minutos después del tratamiento.</p>
      },{
        question: '¿Cómo funciona?',
        answer: 
          <p>Contamos con el mejor equipo LÁSER reconocido mundialmente que te ofrece la más avanzada tecnología del mercado. Los resultados son excepcionales y sorprendentes. Es un láser muy fácil de operar, así que los errores humanos se reducen al mínimo.</p>,
        videoSrc: 'https://www.youtube.com/embed/GVmnAMOAzlY'
      },{
        question: '¿Es doloroso?',
        answer: 
          <p>La mayoría de las personas sienten un poco más de molestia con éste tratamiento pero depende de la sensibilidad de cada persona, por lo que unas personas sienten menos molestia que otras.  Recomendamos el uso de algún anestésico tópico al acudir a su tratamiento. Esta molestia se quita en cuestión de segundos y es minimizada por el sistema de enfriamiento DCD del aparato. Vale la pena ¡Pruébalo!</p>
      },{
        question: '¿Quéda alguna cicatriz o marca?',
        answer: 
          <p>Ninguna ya que el tratamiento es completamente inofensivo con la piel, en ocasiones puede llegar a quedar la piel roja pero en menos de 5 minutos desaparece.</p>
      },{
        question: '¿En cuánto tiempo se ven los resultados?',
        answer: 
          <p>Los resultados comienzan a hacer efecto desde el momento que se aplica el tratamiento, sólo que no son visibles a simple vista ya que trabaja en los tejidos de la piel. Pero la mayoría de las personas manifiestan notar los resultados desde las primeras sesiones.</p>
      }
    ]
  },
  {
    name: 'varices',
    quiz:[
      {
        question: '¿Cuántas sesiones necesito?',
        answer: 
          <div>
            <p>Todos los tratamientos que ofrecemos son personalizados por lo cual al igual que los otros tratamientos las sesiones que se requieren para eliminar las várices depende de muchos factores que pueden impactar la eficacia del tratamiento láser, incluyendo la severidad del caso que se va a tratar. Notando cambios desde la primera sesión, sin embargo para eliminarla por completo, se requieren múltiples sesiones.</p>
            <p>El número de sesiones requeridas dependerá de las condiciones de cada vena a tratar.</p>
            <p>Las sesiones recomendadas para lograr un resultado óptimo son de 1 a 4 sesiones, una sesión cada 2 meses.</p>
          </div>
      },{
        question: '¿Tiene efectos secundarios?',
        answer: 
          <div>
            <p>Ninguno, ya que el <span className="naranja-text">láser</span> es una luz selectiva que sólo trabaja en la primera capa de la piel. Los riesgos son mínimos, en muy pocos casos hay enrojecimiento de la piel, que se te quitará pocos minutos después del tratamiento.</p>
          </div>
      },
      {
        question: '¿Cómo funciona?',
        answer: 
          <div>
            <p>Ninguno, ya que el <span className="naranja-text">láser</span> es una luz selectiva que sólo trabaja en la primera capa de la piel. Los riesgos son mínimos, en muy pocos casos hay enrojecimiento de la piel, que se te quitará pocos minutos después del tratamiento.</p>
          </div>,
        videoSrc: 'https://www.youtube.com/embed/a_Go5qehk4k'
      },{
        question: '¿Es doloroso?',
        answer: 
          <p>
            La mayoría de las personas sienten un poco más de molestia con éste tratamiento pero depende de la sensibilidad de cada persona, por lo que unas personas sienten menos molestia que otras. Recomendamos el uso de algún anestésico tópico al acudir a su tratamiento. Esta molestia se quita en cuestión de segundos y es minimizada por el sistema de enfriamiento DCD del aparato. Vale la pena ¡Pruébalo!
          </p>
      },{
        question: '¿Cuáles son las recomendaciones despues del tratamiento',
        answer: 
        <p>
          En el caso de la eliminación de várices en piernas se recomienda dejar de hacer ejercicio de alto impacto por tres días y usar zapato de tacón bajo por tres días posteriores al tratamiento.
        </p>
      },{
        question: '¿En cuánto tiempo se pueden ver los resultados',
        answer: 
          <p>
            Los resultados comienzan a hacer efecto desde el momento que se aplica el tratamiento, sólo que no son visibles a simple vista ya que trabaja en los tejidos de la piel. Pero la mayoría de las personas manifiestan notar los resultados desde las primeras sesiones.
          </p>
      }
    ]
  },{
    name: 'endermologie',
    quiz: [
      {
        question: '¿Qué es la celulitis?',
        answer: 
        <div>
          <p>Típicamente femenina, la celulitis es el resultado de una acumulación de grasas en los adipocitos (células grasas de la hipodermis) y de una retención de agua alrededor (dermis e hipodermis).</p>
          <p>A medida que los adipocitos van engordando, la capa que los envuelve se deforma y tira de los puntos de anclaje cutáneos, provocando un acolchamiento de la piel. En esta fase, el problema mayor es que el proceso se auto alimenta por el estancamiento de la circulación sanguínea, lo que acarrea la no evacuación de los desechos metabólicos, un empobrecimiento nutritivo y la congestión del tejido conjuntivo que pierde su elasticidad y se enfibrosa.</p>
          <p>Este estadío, muy antiestético, hace que estas células celulíticas sean regiones que permanecen indiferentes al ejercicio físico y a las dietas más drásticas.</p>
        </div>
      },{
        question: '¿Qué es endermologie',
        answer: 
          <p>
            Aunque originalmente la Endermologie® fue creada para tratar problemas cervicales de su autor Luois Paul Guitay (en Francia), los resultados que se reportaron a partir de la industrialización de la máquina Cellu M6 indicaron que la técnica era extraordinaria para combatir la celulitis, la grasa localizada, lograr una silueta más definida y esbelta, y no sólo eso, sino que ayuda a tener un bienestar y mejoría general de todo el organismo.
          </p>,
        videoSrc: 'https://www.youtube.com/embed/6TNdwOOSbhk'
      },{
        question: '¿Realmente funciona?',
        answer: 
          <div>
            <p>
              ¡Por supuesto que funciona! y esto ha sido demostrado en millones de personas (en su mayoría mujeres) en <span className="naranja-text">Europa</span>, <span className="naranja-text">México</span> y otros países. Contamos con reportes de estudios y aplicaciones con fotografías y testimonios que lo comprueban.
            </p>
            <p>
              El equipo <span className="naranja-text">Cellu M6</span> es el único mediante el cual se puede aplicar la técnica <span className="naranja-text">Endermologie®</span> de LPG con excelentes resultados y con más de 500 estudios clínicos realizados por médicos reconocidos de todo el mundo.  
            </p>
          </div>
      },{
        question: '¿Es un tratamiento enfocado a mujeres o puede hacer algo tambien en hombres?',
        answer: 
          <div>
            <p>
              ¡Por supuesto que funciona! y esto ha sido demostrado en millones de personas (en su mayoría mujeres) en <span className="naranja-text">Europa</span>, <span className="naranja-text">México</span> y otros países. Contamos con reportes de estudios y aplicaciones con fotografías y testimonios que lo comprueban.
            </p>
            <p>
              El equipo <span className="naranja-text">Cellu M6</span> es el único mediante el cual se puede aplicar la técnica <span className="naranja-text">Endermologie®</span> de LPG con excelentes resultados y con más de 500 estudios clínicos realizados por médicos reconocidos de todo el mundo.  
            </p>
          </div>
      },{
        question: '¿Cuántas sesiones puedo tener en una semana?',
        answer: 
          <p>
            El número promedio de sesiones es dos por semana; más sesiones no equivalen a mejores o más rápidos resultados.
          </p>
      },{
        question: '¿Cuánto dura una sesión?',
        answer: 
          <p>
            Las sesiones duran en promedio 35 minutos, durante los cuales se enfoca en las áreas con problema, pero también se le dedica tiempo a otras áreas para estimular la circulación y acelerar la eliminación de grasa y toxinas, especialmente en abdomen y espalda.
          </p>
      },{
        question: '¿Después de cuántas sesiones se pueden ver los resultados?',
        answer: 
          <p>
            Por lo general la gente comienza a notar los resultados durante la 6ª u 8ª sesión, pero 15 sesiones es el promedio para un buen resultado.
          </p>
      },{
        question: '¿Cuánto duran los resultados?',
        answer: 
          <p>
            Esto es muy variable, ya que todo depende de la edad, el estilo de vida y los cambios hormonales, lo que sí se recomienda es que la persona se someta a una sesión por mes después del tratamiento completo, lo cual influye mucho en el mantenimiento.
          </p>
      },{
        question: '¿El tratamiento reemplaza la dietas o el ejercicio',
        answer: 
            <p><span className="naranja-text">No</span>, de ninguna manera el tratamiento remplaza a las dietas o al ejercicio, de hecho, si hay sobrepeso, es altamente recomendable combinar <span className="naranja-text">Endermologie®</span>, dieta y ejercicio, si es que quiere lograr la figura que desea.</p>
      },{
        question: '¿Qué sensación se experimenta durante el tratamiento, es doloroso?',
        answer: 
          <p>El tratamiento no causa dolor, nunca debe causarlo, para ello, se puede y debe ajustar la potencia a fin de ofrecer la mayor comodidad a cada persona. Contrario al dolor, la sensación es similar a la que se experimenta cuando uno se somete a un masaje manual, es tan relajante que muchos pacientes la encuentran placentera.</p>
      },{
        question: '¿Existe algún tipo de recomendaciones especiales a seguir durante el tratamiento',
        answer: 
          <p>La <span className="naranja-text">Endermologie®</span> realmente ayudará a su cuerpo a deshacerse de lo indeseado, pero, para que usted pueda eliminar la mayor cantidad de toxinas posibles sí es recomendable que tome como mínimo dos litros de agua diario durante y después del tratamiento lo que permite mejores resultados. También es muy recomendable que procure practicar aunque sea un poco de ejercicio y que cambie sus hábitos alimenticios hacia una dieta más equilibrada y saludable.</p>
      },{
        question: '¿Puedo recibir el tratamiento si estoy embarazada?',
        answer: 
          <p>Muchas mujeres en el mundo se han sometido al tratamiento aún durante el embarazo y hasta el día de hoy no se ha reportado ningún tipo de complicación con relación a la <span className="naranja-text">Endermologie®</span>. Lo que sí se recomienda es que durante esta etapa, que es más para crear reservas que para eliminar, no se reciba ningún tratamiento global, no se debe practicar sobre el vientre, sin embargo, si usted tiene algún padecimiento en las piernas, con <span className="naranja-text">Endermologie®</span> (aplicada sólo en las piernas) se puede mejorar muchísimo la circulación.</p>
      },{
        question: '¿Puedo recibir Endermologie® si tengo varices',
        answer: 
          <p>Tener várices no es una contraindicación, por el contrario, el tratamiento se aplica especialmente en las áreas de vientre, cintura y espalda, lo que ayuda a descongestionar y por lo tanto ayudar al retorno venoso, con lo cual mejora la circulación y sus várices también; el tratamiento no se aplica directamente en el área donde se encuentran las várices.</p>
      },{
        question: '¿Hay alguna contraindicación para el uso de Endermologie®?',
        answer: 
          <p>
            Como en todos los tratamientos existen casos específicos en donde resulta contraindicado el uso de la Endermologie®. Si usted padece de:
            <br/>
            *Cáncer
            <br/>
            *Cualquier tipo de Inflamación
            <br/>
            *Cualquier tipo de infección evolutiva
            <br/>
            *Cualquier tipo de enfermedad evolutiva.
            <br/>
            Es importante que consulte a su médico para que pueda indicarle si puede o no recibir el tratamiento antes de tratar su padecimiento.'
          </p>
      },{
        question: '¿Endermologie® es eficiente para las estrías?',
        answer: 
          <p>Sí, pero solamente cuando las estrías se encuentran del color de la piel, después de la fase de inflamación, cuando son de color rojo (con inflamación) el tratamiento recomendado sería la microdermoabrasión.</p>
      },{
        question: '¿Es verdad que la máquina  puede tonificar la piel?',
        answer:
          <p>Usted notará mejoría en la apariencia de su piel después del tratamiento, notará que ésta se ve y siente más tonificada, definitivamente ayuda contra la flacidez.</p>
      },{
        question: '¿Pérdere peso?',
        answer: 
          <p><span className="naranja-text">Endermologie®</span> NO es una técnica específica para perder peso, sin embargo muchos pacientes han reportado perder peso más fácilmente durante el tratamiento que sin él.</p>
      },{
        question: '¿Por qué se usa un mallay durante el tratamiento?',
        answer:
          <p>La malla permite que el cabezal de la máquina se deslice con mayor facilidad sobre el cuerpo, y a su vez asegura una mayor privacidad y una higiene óptima.</p>
      },{
        question: '¿Cuál es la diferencia entre Endermologie® y liposuccíon?',
        answer: 
          <p><span className="naranja-text">Endermologie®</span>, a diferencia de la liposucción, no es invasiva, es decir, no penetra la piel en manera alguna, de hecho varias personas al probar esta técnica deciden esperar para la liposucción, en tanto que otras deciden recibir los dos tratamientos como parte de un sistema dual para su problema. Endermologie® está siendo usada y estudiada, antes y después de la liposucción, por algunos de los practicantes más reconocidos a nivel mundial en este tipo de cirugía.</p>
      } 
    ]
  },
  {
    name: 'therma',
    quiz: [
      {
        question: 'Tratamientos disponibles: ',
        answer: 
          <ul>
            <li>Tejidos adiposos o grasas localizadas</li>
            <li>Celulitis</li>
            <li>Piel sin tono (flacidez)</li>
            <li>Estrías</li>
            <li>Contracturas Musculares</li>
            <li>Thermorelax (mensaje anti-estrés)</li>
          </ul>
      },{
        question: '¿Cómo actúa?',
        answer: 
          <div>
            <p>El tejido cutáneo y subcutáneo es tratado con la energía combinada de las ondas de ultrasonido y radiofrecuencia.</p>
            <p>Por un lado los <span className="naranja-text">Ultrasonidos</span> penetran en profundidad, potencian la acción térmica con efecto de cavitación, penetrando en la dermis (donde se forma la celulitis), disolviendo las grasas intra-adipocíticas típicas de la celulitis, lo cual favorece la lipólisis (movilización de las grasas) y el drenaje de las grasas, por otro lado, los <span className="naranja-text">Ultrasonidos</span>, mediante un efecto endotérmico, calientan los tejidos superficiales, acelerando el metabolismo de las grasas y reduciendo los edemas (inflamación) otorgándole a la piel un aspecto aterciopelado y tonificado. La <span className="naranja-texto">Fotodinámica</span>, según la longitud de la onda utilizada, estimula, drena y calma el tejido.</p>
            <p>Esta acción triple y eficaz es la fórmula ideal para una verdadera redefinición de tu figura. Además el tratamiento es simple e indoloro, no es invasor y no limita las actividades normales del cliente.</p>
          </div>
      }
    ]
  },{
    name: 'vela',
    quiz: [
      {
        answer: '¿Cómo funciona?',
        question: 
          <p><span className="naranja-text">VelaShape ™</span> utiliza energía combinada conocida como elos ™ para orientar con precisión y calentar los tejidos grasos en el área de tratamiento. Además, el vacío y la manipulación de los tejidos equilibran la piel para revelar una figura más definida.</p>,
        videoSrc: 'https://www.youtube.com/embed/MDAjxIGT2P8'
      },{
        question: '¿Qué áreas del cuerpo pueden ser tratadas para la reducción de la circuferencia',
        answer: 
          <p>Con <span className="naranja-text">VelaShape ™</span>, puedes tratar áreas del cuerpo como los muslos y glúteos, así como brazos y abdomen. Los dos aplicadores (VSmooth y VContour) en el dispositivo ™ VelaShape, están diseñados para áreas grandes y pequeñas, por lo tanto, el tratamiento es seguro y efectivo.</p>
      },{
        question: '¿Qué tán rápido puedo ver resultados?',
        answer: 
        <p>
          La mejora gradual de la zona tratada se puede ver tras el primer tratamiento, la superficie de la piel de la zona tratada se siente más suave. Resultados de la circunferencia y la reducción de la celulitis será más evidente a partir de la sexta u octava semana posterior a su última sesión.
        </p>
      },{
        question: '¿Cuántos centímetros puedo reducir de mi circunferencia?',
        answer: 
        <p>
          En estudios clínicos, los pacientes reportan una reducción promedio de alrededor de 4 a 6 centímetros en el área del abdomen entre la primera y segunda sesión y en los muslos hasta 2 centímetros dependiendo el tipo de celulitis en tan sólo 4 sesiones.
        </p>
      },{
        question: '¿Cómo puedo mejorar y mantener resultados de VelaShape™?',
        answer: 
          <p>Después de su régimen de tratamiento completo, es recomendable que tenga un tratamiento periódico de mantenimiento. Como todas las técnicas no quirúrgicas o quirúrgicas, los resultados van a durar más tiempo si sigue una dieta balanceada y se ejercita regularmente.</p>
      },{
        question: '¿Es un tratamiento seguro?',
        answer: 
          <p><span className="naranja-text">VelaShape™</span> está aprobado por la FDA como dispositivo seguro y eficaz para todo tipo de piel. Los efectos a corto plazo pueden incluir moretones o enrojecimiento leve.</p>
      },{
        question: '¿Este tratamiento es para mí?',
        answer: 
          <p>La mayoría de la población es apta para recibir el tratamiento <span className="naranja-text">VelaShape™</span>. Usted debe consultar con su médico antes de recibir los tratamientos. Para contraindicaciones, consulte a su representante <span className="naranja-text">VelaShape™</span>.</p>
      },{
        question: '¿Qué se siente durante el tratamiento?',
        answer:
          <p>La mayoría de los pacientes afirman que el tratamiento es agradable, seguida por una sensación de calor muy por debajo de su piel.</p>
      },{
        question: '¿El tratamiento duele?',
        answer:
          <p>La mayoría de los pacientes encuentran los tratamientos cómodos, como un masaje caliente de tejido profundo. El tratamiento está diseñado para adaptarse a tu sensibilidad a un nivel confortable. Es normal experimentar una sensación de calor por algunas horas después del tratamiento. Su piel puede estar más roja de lo normal durante varias horas.</p>
      },{
        question: '¿Cómo me sentiré después del tratamiento?',
        answer: 
          <p>Es normal tener una sensación de calor interno por algunas horas posterior al tratamiento.</p>
      },{
        question: '¿Cuáles son las ventajas de VelaShape™ en comparación con otros métodos?',
        answer: 
          <p>
            Nuestra ventaja es nuestra tecnología. Hoy en día, no hay otros métodos disponibles, que incluyan una combinación de radiofrecuencia bipolar, luz infrarroja,  vacío (succión) y el masaje mecánico como <span className="naranja-text">VelaShape ™</span>;  ningún otro método puede garantizar los resultados probados clínicamente, eficacia y seguridad en 4 sesiones como VelaShape™.
          </p>
      },{
        question: '¿Por qué es mejor VelaShape™ que Cavitación?',
        answer:
          <div>
            <p>La cavitación es un tratamiento en el cual se generan de forma controlada pequeñas burbujas que acaban con las células grasas.</p>
            <p>No es una técnica que se pueda aplicar deliberadamente a cualquier persona, ya que se pueden dañar órganos de vital importancia como puedan ser los ovarios o la glándula tiroidea, por lo cual en algunos lugares de <span className="naranja-text">México</span> y <span className="naranja-text">USA</span> está prohibida o limitada sólo para médicos.</p>
            <p>La cavitación genera una gran cantidad de calor que conduce a un mayor riesgo de quemaduras, ampollas y cicatrices.</p>
            <p>Entre otros riesgos, están los siguientes:</p>
            <p>• Se pueden producir daños en la tiroides (cuando los tratamientos se realizan en el cuello) o en los ovarios (cuando se trata la zona abdominal).</p>
            <p>• Está completamente prohibido en personas que padecen enfermedades graves autoinmunes.</p>
            <p>• Pueden aparecer leves hematomas al realizar la infiltración, así como la rotura de algún pequeño capilar mientras se está realizando el tratamiento.</p>
            <p>• Problemas de oído: el aparato produce un sonido que puede ser leve o molesto, según la agudeza auditiva del paciente, pero que puede llegar a dañar el oído de manera severa.</p>
            <p>Entre muchas otras contraindicaciones, podemos mencionar algunas:</p>
            <p>• Personas con placas de metal, aún cuando la placa se encuentre en áreas lejanas de la zona donde se quiere recibir la cavitación.</p>
            <p>• Mujeres con DIU de cobre o implantes de hormonas hechos con fibras de poliéster, una aleación de titanio y níquel y acero inoxidable.</p>
            <p>Mientras que <span className="naranja-text">Vela Shape</span> es un tratamiento simple e indoloro, no es invasor y combina la energía óptica infrarroja, la radiofrecuencia y la succión, la combinación de estas tres tecnologías hace de VelaShape™ la opción más acertada para recuperar y moldear la figura, ya que actúa sobre el tejido adiposo localizado, las irregularidades y la flacidez de la piel.</p>
            <p><span className="naranja-text">Vela Shape™</span> está aprobado por la FDA por su eficacia y seguridad y ha sido probado clínicamente: ¡<span className="naranja-text">UNA CONFIRMACIÓN MÁS DE SU CONFIABILIDAD</span>!</p>
            <p><span className="naranja-text">Vela Shape™</span>, remodela y redefine tu figura mejorando el aspecto de la celulitis y reduciendo tu circunferencia con resultados visibles en sólo 4 sesiones, sin molestia ni tiempo de recuperación.</p>
          </div>
      },{
        question: 'Resultados',
        answer: 
          <div>
            <ul>
              <li>Disminuye el aspecto de la celulitis resistente y rebelde.</li>
              <li>Se obtiene una reducción significativa de la circunferencia.</li>
              <li>Remodelación corporal y reducción de la flacidez y la celulitis posteriores al parto.</li>
            </ul>
            <p>Una preocupación natural de la mayoria de las nuevas madres tras el embarazo y el parto esel aumento de peso, el abdomen y las caderas abultadas por acumulación de grasa que usualmente van acompañadas de flacidez de la piel.<span className="naranja-text">¡Con Vela Shape™ recuperar tu figura es más facil!</span> </p>
          </div>
      }
    ]
  }
];  

//to work hash in Link see https://github.com/ReactTraining/react-router/issues/394
function hashLinkScroll() {
  const { hash } = window.location;
  if (hash !== '') {
    // Push onto callback queue so it runs after the DOM is updated,
    // this is required when navigating from a different page so that
    // the element is rendered on the page before trying to getElementById.
    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) element.scrollIntoView();
    }, 0);
  }
}

class Services extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      quiz: [],
      showSideBar: false,
      showModalVideo: false,
      videoSrc: ''
    }
    //this.onClickFAQ = this.onClickFAQ.bind(this);
    this.onHandleCancel = this.onHandleCancel.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.onCloseVideo = this.onCloseVideo.bind(this);
    //this.onClickLink = this.onClickVideo.bind(this);
  }
  
  componentDidMount(){
    //hashlink
    hashLinkScroll();
  }
  componentDidUpdate(prevProps, prevState){
    //hashlink
    if( this.state.showModal == prevState.showModal && 
        this.state.showModalVideo == prevState.showModalVideo )
        hashLinkScroll();
  }

  toggleSidebar(){
    this.setState({ showSideBar: this.state.showSideBar ? false : true });
  }

  onClickFAQ(service){
    const faq = allquiz.find(quiz => quiz.name == service);
    this.setState((prevState)=>{
     return { showModal: !prevState.showModal, quiz: faq.quiz }
    });
  }
  onClickVideo(videoSrc = ''){
    this.setState({ showModalVideo: true , videoSrc: videoSrc })
  }
  onCloseVideo(){
    this.setState({ showModalVideo: false })
  }
  onHandleCancel(){
    this.setState((prevState)=>{
      return { showModal: !prevState.showModal }
    });
  }

  render(){
    return(
    <div>
      <div className="services">
        <ServiceIndex  
          visible={this.state.showSideBar}
          onClickLink={this.toggleSidebar}
        />
        <Affix style={{position: 'fixed', width: '100%', zIndex: '1000'}} onClick={this.toggleSidebar} >
          <div className='sticky-services' >
            <Icon type="bars" /><span>TRATAMIENTOS</span>
          </div>
        </Affix>
        {this.state.showModal &&
        <ServicesModal
          visible={this.state.showModal}
          onCancel={this.onHandleCancel}
          quiz={this.state.quiz}
        />}x
        <VideoModal
          visible={this.state.showModalVideo}
          onClose={this.onCloseVideo}
          videoSrc={this.state.videoSrc}
        />
        <div id="depilacion" className="service-block">
          <div className="service-image lg-flex-1 less-lg-image-height" >
            <img src='/public/img/dep.jpg' alt="depilacion" className="img-responsive" />
          </div>
          <div className="service-description lg-flex-25 less-lg-flex-1">
            <div className="service-header">
              <h3  >DEPILACIÓN LÁSER</h3>
              <div className="service-spacer service-spacer-left"></div>
            </div>
            <div className="service-text">
              <p>
                Elimina para siempre el vello de todas las partes de tu cuerpo que desees y mejora en gran medida la textura de tu piel. Además, blanquea y quita manchas de las zonas afectadas por otros métodos de depilación.
              </p>
            </div>
            <div className="service-footer" >
              <div className="service-faq" onClick={this.onClickFAQ.bind(this,'depilacion')} >
                PREGUNTAS FRECUENTES
              </div>
              <div className="service-video">
                  <Icon type="play-circle"  onClick={this.onClickVideo.bind(this,'http://www.youtube.com/embed/haG7isWaIW4')} />
              </div>
            </div>
          </div>
        </div>
        <div  id="antiedad" className="service-block">
          <div className="service-description lg-flex-25 less-lg-flex-1 less-lg-first-flex">
            <div className="service-header">
              <h3 >TRATAMIENTO ANTIEDAD</h3>
              <div className="service-spacer service-spacer-right"></div>
            </div>
            <div className="service-text">
              <p>
              Luce una piel más suave, lisa, luminosa y resplandeciente. Es un tratamiento preventivo que ayuda a la regeneración progresiva de las células estimulando la producción de colágeno y elastina, por lo cual evita la pérdida de elasticidad de la piel retardando así los efectos del envejecimiento, además, suaviza la textura de la piel, ayuda a reafirmar los tejidos de cara y cuello, y en algunos casos, atenúa las líneas de expresión no profundas.
              </p>
            </div>
            <div className="service-footer" >
              <div className="service-faq" onClick={this.onClickFAQ.bind(this,'antiedad')} >
                PREGUNTAS FRECUENTES
              </div>
              <div className="service-video">
                <Icon type="play-circle"  onClick={this.onClickVideo.bind(this,'https://www.youtube.com/embed/GVmnAMOAzlY')} />
              </div>
            </div>
          </div>
          <div className="service-image lg-flex-1 less-lg-image-height less-lg-first-second" >
            <img src='/public/img/anti.jpg' alt="depilacion" className="img-responsive" />
          </div>
        </div>
        <div id="varices" className="service-block">
          <div className="service-image lg-flex-1 less-lg-image-height" >
            <img src='/public/img/vari.jpg' alt="depilacion" className="img-responsive" />
          </div>
          <div className="service-description lg-flex-25 less-lg-flex-1">
            <div className="service-header">
              <h3 >ELIMINACIÓN DE VÁRICES Y VENAS FACIALES</h3>
              <div className="service-spacer service-spacer-left"></div>
            </div>
            <div className="service-text">
              <p>
                Elimina por completo las várices de tu cara y cuerpo no mayores a 3mm de grosor y menos de 5mm de profundidad, es decir, todas aquellas venas que representan un problema estético 
                <span className="naranja-text"> NO </span>
                médico. En la mayoría de los casos verás los resultados desde tu  
                <span className="naranja-text"> primera </span>
                cita.
              </p>
            </div>
            <div className="service-footer" >
              <div className="service-faq" onClick={this.onClickFAQ.bind(this, 'varices')} >
                PREGUNTAS FRECUENTES
              </div>
              <div className="service-video">
                <Icon type="play-circle"  onClick={this.onClickVideo.bind(this,'http://www.youtube.com/embed/a_Go5qehk4k')} />
              </div>
            </div>
          </div>
        </div>
        <div id="endermologie" className="service-block">
          <div className="service-description lg-flex-25 less-lg-flex-1 less-lg-first-flex">
            <div className="service-header">
              <h3 >ENDERMOLOGIE</h3>
              <div className="service-spacer service-spacer-right"></div>
            </div>
            <div className="service-text text-90">
              <p>
                <span className="naranja-text">Tu aliado contra la celulitis y tu fuente de bienestar y salud</span>
                . Luce un cuerpo esbelto y afinado, una piel más suave y más firme.
                Aparte este procedimiento indoloro ofrece bienestar y relajación, no exige ninguna intervención médica ni tomar substancias químicas. Se trata únicamente de restablecer ciertas funciones naturales del organismo y la piel.
                Moldea tu figura en las zonas que más lo necesiten, sin disminuir el volumen en áreas donde no se desea. Además Endermologie, por su acción relajante y calmante, tiene un efecto anti estrés innegable.
                Endermologie es particularmente útil contra los efectos del tiempo. Porque con los años los problemas circulatorios tienden a agravarse, el aspecto celulítico se acentúa y la piel pierde su firmeza. Al aumentar la micro circulación local, la técnica de LPG permite restaurar la nutrición y el desarrollo del tejido conjuntivo y, por lo tanto, mejora el aspecto y tonicidad de los tejidos.
              </p>
            </div>
            <div className="service-footer" >
              <div className="service-faq" onClick={this.onClickFAQ.bind(this, 'endermologie')} >
                PREGUNTAS FRECUENTES
              </div>
              <div className="service-video">
                <Icon type="play-circle"  onClick={this.onClickVideo.bind(this,'https://www.youtube.com/embed/6TNdwOOSbhk')} />
              </div>
            </div>
          </div>
          <div className="service-image lg-flex-1 less-lg-image-height less-lg-first-second" >
            <img src='/public/img/ender.jpg' alt="depilacion" className="img-responsive" />
          </div>
        </div>
        <div id="therma" className="service-block">
          <div className="service-image lg-flex-1 less-lg-image-height" >
            <img src='/public/img/therma.jpg' alt="depilacion" className="img-responsive" />
          </div>
          <div className="service-description lg-flex-25 less-lg-flex-1">
            <div className="service-header">
              <h3  >THERMASHAPE</h3>
              <div className="service-spacer service-spacer-left"></div>
            </div>
            <div className="service-text text-90">
              <p>
                <span className="naranja-text">Esta nueva y eficaz tecnología permite que la piel obtenga un aspecto más juvenil, aterciopelado y tonificado. </span>
                 Therma-shape es el sistema más innovador y eficaz para tratar la celulitis, grasas localizadas y remodelar tu cuerpo. Su funcionamiento se basa en combinar la radiofrecuencia, el ultrasonido y la fotodinámica, garantizando resultados sorprendentes.
                Esta acción triple y eficaz es la fórmula ideal para una verdadera remodelación del cuerpo. Además, el tratamiento es simple, indoloro, no es invasor y no limita las actividades normales del cliente.
                Thermashape ha sido probado clínicamente: ¡una confirmación más de su confiabilidad! Los resultados son visibles desde las primeras sesiones.
              </p>
            </div>
            <div className="service-footer" >
              <div className="service-faq" onClick={this.onClickFAQ.bind(this, 'therma')} >
                PREGUNTAS FRECUENTES
              </div>
            </div>
          </div>
        </div>
        <div id="vela" className="service-block">
          <div className="service-description lg-flex-25 less-lg-flex-1 less-lg-first-flex">
            <div className="service-header">
              <h3 >VELASHAPE</h3>
              <div className="service-spacer service-spacer-right"></div>
            </div>
            <div className="service-text">
              <p>
                <span className="naranja-text">
                Combate la celulitis, obtén una piel suave y un cuerpo más sexy. VelaShape ™  
                </span>
                 es el único dispositivo aprobado por la FDA que moldea con eficacia y seguridad. Remodela y redefine tu figura mejorando el aspecto de la celulitis y reduciendo tu circunferencia con resultados visibles en sólo 4 sesiones, sin molestia ni tiempo de recuperación.
              </p>
            </div>
            <div className="service-footer" >
              <div className="service-faq" onClick={this.onClickFAQ.bind(this, 'vela')} >
                PREGUNTAS FRECUENTES
              </div>
              <div className="service-video">
                <Icon type="play-circle"  onClick={this.onClickVideo.bind(this,'http://www.youtube.com/embed/MDAjxIGT2P8')} />
              </div>
            </div>
          </div>
          <div className="service-image lg-flex-1 less-lg-image-height less-lg-first-second" >
            <img src='public/img/vela.jpg' alt="depilacion" className="img-responsive" />
          </div>
        </div>
        <div id="vibra" className="service-block">
          <div className="service-image lg-flex-1 less-lg-image-height" >
            <img src='/public/img/vibra.jpg' alt="depilacion" className="img-responsive" />
          </div>
          <div className="service-description lg-flex-25 less-lg-flex-1">
            <div className="service-header">
              <h3  >VIBRABODY</h3>
              <div className="service-spacer service-spacer-left"></div>
            </div>
            <div className="service-text">
              <ul>
                <li>
                  Previene enfermedades y acelera la circulación sanguínea. Ejercítate el equivalente a 1 hora con tan sólo 15 minutos diarios.
                </li>
                <li>
                  Reduce Grasa corporal, colesterol y celulitis.
                </li>
                <li>
                  Alivia el estreñimiento.
                </li>
                <li>
                  Previene la osteoporosis.
                </li>
                <li>
                  Mejora la circulación y disminuye las várices.
                </li>
                <li>
                  Corrige problemas vertebrales.
                </li>
                <li>
                  Combate el estrés y depresión.
                </li>
                <li>
                  Rehabilita músculos después de cirugías o lesiones.
                </li>
                <li>
                  Apto para todas las edades y condiciones físicas.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }
};

export default Services;