import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Route, Redirect } from 'react-router-dom';

import BranchSiderBar from '../components/branches/branchSiderBar';
import BranchNavBar from '../components/branches/branchNavBar';
import BranchContent from '../components/branches/branchContent';
//action for setSiderBar
import { setSidebarComponent } from '../../../actions/sidebarActions';
//TODO
//get this data from server
 const branches = [{ key: "Chih",
            name: "Chihuahua",
            child:[
          { key: "/suscursales/delicias",
            name: "Delicias",
            city: 'Delicias',
            state: 'Chih',
            address: 'Ave. 7a Oriente # 718 Plaza Oriente Col. Centro, C.P. 33000',
            phone: '(639) 472 43 55',
            serviceHours: 'Lunes a Viernes 9:00 - 14:00 y 15:00 - 19:30 Sábado 9:30 - 19:00',
            treatments: 
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'},
              { treatment: 'Thermashape', link: '/servicios#therma'},
              { treatment: 'Vibrabody',link: '/servicios#vibra'},
              { treatment: 'Endermologie',link: '/servicios#endermologie'},
              { treatment: 'Limpiezas Faciales', link: '/servicios'}],
            googleMapsSrc:'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7032.998361565082!2d-105.45779904505109!3d28.192142687790447!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xa56050bc5428ce2e!2sKopay+Delicias!5e0!3m2!1sen!2smx!4v1460586635863',
            imgSrc: '/img/delicias1.jpg'
          },
          { key: "/suscursales/agustin",
            name: "Chihuahua, San Agustin",
            city: 'Chihuahua',
            state: 'Chih',
            address: 'Ave. Tecnológico # 4101 Plaza San Agustín, Local 9 Col. Granjas, C.P. 31100',
            phone: '(614) 426 70 00',
            serviceHours: 'Lunes a Viernes 8:00 - 20:00 Sábado 8:30 - 19:00',
            treatments: 
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'},
              { treatment:'Velashape', link: '/servicios/vela'}],
            googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5887.603747517493!2d-106.09056779672763!3d28.66600191158472!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x614ca26c5d4f2a82!2sKopay+Chihuahua+San+Agust%C3%ADn!5e0!3m2!1sen!2smx!4v1460586900224',
            imgSrc: '/img/sana1.jpg'
          },
          { key: "/suscursales/plaza",
            name: "Chihuahua, Plaza 3106",
            city: 'Chihuahua',
            state: 'Chih',
            address: 'Periférico de la Juventud #3106 Plaza 3106, Local 20 Hacienda Santa Fe, C.P. 31125',
            phone: '(614) 4 30 10 20',
            serviceHours: 'Lunes a Viernes 9:00 - 20:00 Sábado 9:00 - 19:00',
            treatments: 
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
            googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0601869016796!2d-106.11886448523161!3d28.627958191039426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ea5d2a011a91c5%3A0xd5721822db756807!2sKopay+Chihuahua+Plaza+31ceroseis!5e0!3m2!1ses-419!2smx!4v1467765071987',
            imgSrc: '/img/periferico.jpg'
          },
          { key: "/suscursales/cuauhtemoc",
            name: "Cuauhtémoc",
            city: 'Cuauhtémoc',
            state: 'Chih',
            address: 'Ave. 16 Septiembre #1450 Local 5 Plaza Rima Col. Centro, C.P. 31500',
            phone: '(625) 590 47 80',
            serviceHours: 'Lunes a Viernes 8:00 - 20:00 Sábado 8:00 - 20:00',
            treatments: 
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
            googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.103075131972!2d-106.08463398544956!3d28.626672691098047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ea5cb41242c7f3%3A0x8505cf2fec4a4d99!2s16+de+Septiembre+1450%2C+Cuauht%C3%A9moc%2C+31020+Chihuahua%2C+Chih.!5e0!3m2!1ses-419!2smx!4v1503692158966',
            imgSrc: '/img/cua1.jpg'
          },
          { key: "/suscursales/camargo",
            name: "Camargo",
            city: 'Camargo',
            state: 'Chih',
            address: 'Calle Vicente Guerrero # 912 Col. Centro, C.P. 33700',
            phone: '(648) 462 15 15',
            serviceHours: 'Lunes a Viernes 9:00 - 13:00 y 15:00 - 19:30 Sábado 9:00 - 13:00 y 15:00 - 19:00',
            treatments:
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
            googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.819596784628!2d-105.17213738525133!3d27.691970132775065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8694aeff03ad0e0d%3A0x9338b79f4f78aa69!2sVicente+Guerrero+912%2C+Centro%2C+33700+Cd+Camargo%2C+Chih.!5e0!3m2!1ses!2smx!4v1461088238955',
            imgSrc: '/img/camargo1.jpg'
          },
          { key: "/suscursales/parral",
            name: "Parral",
            city: 'Parral',
            state: 'Chih',
            address: 'Ave. Independencia y Calle Vallarta # 1, Local 2. Col. Centro, C.P. 31500',
            phone: '(627) 523 65 56',
            serviceHours: 'Lunes a Viernes 9:00-13:00 y 15:00-19:00 Sábado 9:00-13:00, 14:30-18:30',
            treatments:
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'},
              { treatment: 'Endermologie',link: '/servicios#endermologie'}],
            googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14228.159869226049!2d-105.6610931!3d26.9339474!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x81961ebb94e53b27!2sKopay+Parral!5e0!3m2!1sen!2smx!4v1460595053850',
            imgSrc: '/img/parral2.jpg'
          },
          { key: "/suscursales/juarez",
            name: "Juárez",
            city: 'Juárez',
            state: 'Chih',
            address: 'Ave. Antonio J. Bermúdez # 8770 y Blvd. Tomás Fernández Plaza Senecu, Local 7 Col. Parque Industrial Bermúdez, C.P. 32470',
            phone: '(656) 6 25 35 35',
            serviceHours: 'Lunes a Viernes 9:00 - 20:00 Sábado 9:00 - 19:00',
            treatments:
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
            googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13575.644303866038!2d-106.396124!3d31.718324!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x7ebb7c008a59223b!2sKopay+Ju%C3%A1rez!5e0!3m2!1sen!2smx!4v1460685364178',
            imgSrc: '/img/juarez1.jpg'
          }
          ]
        },
        { key: "Dgo",
          name: "Durango",
          child: [
            { key: "/suscursales/durango",
              name: "Durango",
              city: 'Durango',
              state: 'Dgo',
              address: 'Av. 20 noviembre 1105 ote. Esq. con Lázaro Cárdenas (antes Libertad) Colonia Nueva Vizcaya, C.P. 34000',
              phone: '(618) 810 8100',
              serviceHours: 'Lunes a Viernes 8:30 - 20:30 Sábado 9:00 - 19:00',
              treatments: 
                [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
                { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13575.644303866038!2d-106.396124!3d31.718324!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x7ebb7c008a59223b!2sKopay+Ju%C3%A1rez!5e0!3m2!1sen!2smx!4v1460685364178',
              imgSrc: '/img/durango2.jpg'
            }
          ]
        },
        { key: "Jal",
          name: "Jalisco",
          child:[
            { key: "/suscursales/manuel",
              name: "Gdl, Manuel Acuña",
              city: 'Guadalajara',
              state: 'Jal',
              address: 'Manuel Acuña # 3184 (Esquina con Azteca) Plaza Atelier Galería, Local 15 Col. Monraz, C.P. 44670',
              phone: '(33) 38 13 08 88',
              serviceHours: 'Lunes a Viernes 9:00 - 20:00 Sábado 9:00 - 20:00',
              treatments:
                [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
                { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
                { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14930.508958408625!2d-103.395357!3d20.684739!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x943b26ae94645c07!2sKopay+Guadalajara+Manuel+Acu%C3%B1a!5e0!3m2!1sen!2smx!4v1460595113226',
              imgSrc: '/img/acuna1.jpg'
            },
            { key: "/suscursales/chapultepec",
              name: "Gdl, Chapultepec",
              city: 'Guadalajara',
              state:'Jal',
              address: 'Ave. Chapultepec # 480 Centro Comercial Las Ramblas, Local 13 Col. Americana, C.P. 44140',
              phone: '(33) 36 15 11 01',
              serviceHours: 'Lunes a Viernes 9:00 - 20:00 Sábado 9:00 - 20:00',
              treatments:
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14932.1512684316!2d-103.369623!3d20.6680404!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x8626d762577f979b!2sSkincareKopay!5e0!3m2!1sen!2smx!4v1460595305645',
              imgSrc: '/img/chapu1.jpg'
            },
            { key: "/suscursales/patria",
              name: "Zapopan, Patria",
              city: 'Zapopan',
              state: 'Jal',
              address:'Ave. Patria # 240 (Esq. con Sebastian Bach) Plaza Bach, Local 6 Residencial La Estancia, C.P. 45030',
              phone: '(33) 31 65 21 15',
              serviceHours: 'Lunes a Viernes 9:00 - 20:00 Sábado 9:00 - 20:00',
              treatments:
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.9498893253285!2d-103.42586898522883!3d20.671617596694787!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428ae975e4b5b3d%3A0x33fdb41ca0a81ad!2sKopay+Guadalajara+Patria!5e0!3m2!1sen!2smx!4v1460595480230',
              imgSrc: '/img/patria2.jpg'
            }
          ]
        },
        { key: "N.L.",
          name: "Nuevo León",
          child: [
            { key: "/suscursales/cumbres",
              name: "Mty, Cumbres",
              city: 'Monterrey',
              state: 'NL',
              address: 'Av. Paseo de los Leones # 3433 U3 Plaza, Local 112 Col. Cumbres las Palmas, C.P. 64349',
              phone: '(81) 1095-2012',
              serviceHours: 'Lunes a Viernes 9:30 - 19:30 Sábado 9:00 - 19:00',
              treatments: 
                [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
                { treatment: 'Tratamiento Anti  edad', link: '/servicios#antiedad'},
                { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.151713133094!2d-100.40122608529023!3d25.732496016089662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662971c1a354159%3A0xd4a75475303c5e0!2sAv+Paseo+de+los+Leones+3433%2C+Cumbres+Las+Palmas+Residencial%2C+64349+Monterrey%2C+N.L.!5e0!3m2!1ses!2smx!4v1461088471054',
              imgSrc: '/img/cumbres.jpg'
            },
            { key: "/suscursales/valle", 
              name: "Mty, Valle",
              city: 'Monterrey',
              state: 'NL',
              address: 'Ave. Gómez Morín Sur # 900 Plaza Vita, Local 12 Col. Carrizalejo, C.P. 66254 San Pedro Garza García, NL',
              phone: '(81) 19 69 30 73 y (81) 83 00 00 03',
              serviceHours: 'Lunes a Viernes 9:30 - 19:30 Sábado 9:00 - 19:00',
              treatments:
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.860927885698!2d-100.36348468529197!3d25.642740819773334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662bdc5c5555453%3A0x41765e34130b6ef4!2sKopay+Monterrey+Valle!5e0!3m2!1sen!2smx!4v1460595635713',
              imgSrc: '/img/valles1.jpg'
            }
          ]
        },
        { key: "Nay",
          name: "Nayarit",
          child: [
            { key: "/suscursales/tepic",
              name: "Tepic",
              city: 'Tepic',
              state: 'Nay',
              address: 'Paseo de la Loma # 413 (Frente al Gimnasio Niños Héroes) Residencial la Loma, C.P. 63137',
              phone: '(311) 133 1800',
              serviceHours: 'Lunes a Sabado 8:00 - 20:00',
              treatments:
                [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
                { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
                { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'},
                { treatment: 'Masajes',link: 'servicios'},
                { treatment: 'Limpiezas Faciales', link: '/servicios'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3712.034004588978!2d-104.9035956853632!3d21.506387976677583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842736fa3626cfe7%3A0x8fd16b2903603f61!2sKopay+Tepic!5e0!3m2!1sen!2smx!4v1460595696767',
              imgSrc: '/img/tepic2.jpg'
            }
          ]
        },
        { key: "Coah",
          name: "Coahuila",
          child: [
            { key: "/suscursales/laguna",
              name: "Torreón, Galerías Laguna",
              city: 'Torreón, Coahuila',
              state: 'Coah',
              address: 'Periférico Raúl López Sánchez # 6000 Galerías Laguna, Local Exterior # 159 Col. El Fresno, C.P. 27018',
              phone: '(871) 750 77 76',
              serviceHours: 'Lunes a Viernes 9:30 - 13:30, 15:30 - 19:30 Sábado 9:30 - 13:30, 15:30 - 19:30',
              treatments: 
                [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
                { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
                { treatment:'Velashape', link: '/servicios/vela'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14394.855703446146!2d-103.4031272!3d25.5811827!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x8e71645218d6e018!2sKopay+Torre%C3%B3n+Galer%C3%ADas!5e0!3m2!1ses!2smx!4v1461175942838',
              imgSrc: '/img/laguna1.jpg'
            }
          ]
        },
        { key: "S.L.P",
          name: "San Luis Potosí",
          child: [
            { key: "/suscursales/slp",
              name: "San Luis Potosí",
              city: 'San Luis Potosi',
              state: 'SLP',
              address: 'Calle Cordillera Karacorum # 410, Esquina Cordillera Real Plaza Cordillera, Local 4 Lomas 3a Sección. C.P. 78216',
              phone: '(444) 825 08 48',
              serviceHours: 'Lunes a Viernes 9:30 - 14:00 y 16:00 - 19:00 Sábado 9:30 - 19:00',
              treatments: 
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3695.5322516177685!2d-101.02845968535318!3d22.14380295415403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842a992a06a03233%3A0xab14699b75c71085!2sKopay+San+Luis+Potos%C3%AD!5e0!3m2!1sen!2smx!4v1460595811869',
              imgSrc: '/img/sanluis.jpg'
            }

          ]
        },
        { key: "B.C",
          name: "Baja California",
          child: [
            { key: "/suscursales/tijuana",
              name: "Tijuana",
              city: 'Tijuana',
              state: 'BC',
              address: 'Boulevard Agua Caliente 10387',
              phone: '(664) 686-1220',
              serviceHours: 'Lunes a Viernes 8:00 - 20:00 Sábado 8:00 - 20:00',
              treatments: 
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
              { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3364.453233284798!2d-117.01448868505082!3d32.51403998105223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d9483e8308bff3%3A0xcac0b4ac903d23c9!2sKopay+Tijuana!5e0!3m2!1ses-419!2smx!4v1474577639969', 
              imgSrc: '/img/tijuana1.jpg'
            }
        ]
        },
        { key: "Gto",
          name: "Guanajuato",
          child: [
            { key: "/suscursales/leon",
              name: "León",
              city: 'León',
              state: 'Gto',
              address: 'Paseo del Moral 402 PLAZA LA ROTONDA Local 6 Col. Jardines del Moral, C.P. 37160 ',
              phone: '(477) 718 1020',
              serviceHours: 'Lunes a Sábado 8:30-8:00 (citas a las 9:00)',
              treatments:
                [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
                { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
                { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14884.457923691223!2d-101.6904228!3d21.1478419!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xdd7320f6b0bf88c0!2sKopay+Le%C3%B3n!5e0!3m2!1ses-419!2smx!4v1473975559131',
              imgSrc: '/img/logo.jpg'
            }
          ]
        },
        { key: "cdmx",
          name: "Ciudad de Mexico",
          child: [
            { key: "/suscursales/pedregal",
              name: "Pedregal",
              city: 'Pedregal',
              state: 'CDMX',
              address: 'Ave Revolución No. 2015 Plaza Comercial Vista Pedregal Piso 1. Local 6 Colonia la Otra Banda,C.P. 01090',
              phone: '(55) 5550 9181',
              serviceHours: 'Lunes a Viernes 8:00 - 20:00 Sábado 8:00 - 20:00',
              treatments:
                [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
                { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'},
                { treatment: 'Eliminación de Várices y Venas Faciales', link:'/servicios#varices'}],
              googleMapsSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3764.7752004432473!2d-99.19532858509483!3d19.335558686939468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cdffff7b86c9bb%3A0x903ab40f42c8e26a!2sAv.+Revoluci%C3%B3n+2015%2C+La+Otra+Banda%2C+Ciudad+de+M%C3%A9xico%2C+D.F.!5e0!3m2!1ses-419!2smx!4v1473983396677',
              imgSrc:'/img/pedregal1.jpeg'}
          ]
        },
        {
          key: "qro",
          name: 'Quéretaro',
          child:[
            {key: "/suscursales/juriquilla",
            name: "Juriquilla",
            city: 'Juriquilla',
            state: 'Qro',
            address: ' Boulevard Jurica la campana #898, Plaza comercial Tiara, residencial Caletto',
            phone: '41548483',
            serviceHours: 'Lunes a Viernes 9:00 - 20:00 Sábado 9:00 - 17:00',
            treatments:
              [{ treatment:'Depilación Láser',link: '/servicios#depilacion'},
              { treatment: 'Tratamiento Antiedad', link: '/servicios#antiedad'}],
            googleMapsSrc: 'https://maps.google.com/maps?q=plazatiara&t=&z=17&ie=UTF8&iwloc=&output=embed',
            imgSrc:'/img/juriquilla.jpeg'}
          ]
        },{
          key: 'sin',
          name: 'Sinaloa',
          child:[
            { key: '/suscursales/culiacan',
              name: 'Kopay Culiacán',
              city: 'Culiacán Rosales',
              state: 'Sinaloa',
              address: 'Plaza 2255 Blvd. Enrique Sánchez Alonso #2255, Desarrollo Urbano Tres Ríos, 80020',
              imgSrc: '/img/culiacan.jpg'
            }
          ]
        }
        

]


class Branches extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      branch: branches[0].child[0]
    };
    this.getBranch = this.getBranch.bind(this);

  }
  getBranch(branchKey){
    const key = '/suscursales/' + branchKey;
    const branch = branches.find( item => {
      return item.child.some(cItem => {
        return cItem.key == `/suscursales/${branchKey}`});
      }).child.find( cItem => cItem.key == `/suscursales/${branchKey}`);
    this.setState({branch: branch});
  }
  componentWillMount() {
    // this.props.setSideBar(true);
  }
  componentDidMount(){
    const { location, history } = this.props;
    if(location.pathname == '/suscursales' )
      history.push('/suscursales/delicias');
  }
  componentWillUnmount() {
    // this.props.setSideBar(false);
  }
  render() {
    let { branch } = this.state;
    return (
      <div className="branches-container">
        <div className="branch-navbar hide-on-lg">
          <BranchNavBar items={branches}/>
        </div>
        <div className="branch-sidebar show-on-lg">
          <BranchSiderBar items={branches}/>
        </div>
        <div className='branch-content' >
          <Route path="/suscursales/:suscursal" children={(props)=><BranchContent branch={branch} getBranch={this.getBranch} />} />
        </div>
      </div>
    );  
  }
}

Branches.propTypes = {
  setSideBar: PropTypes.func.isRequired
}
const mapStateToProps = (state, props) => {
  return {
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSideBar: (set) => {
      dispatch(setSidebarComponent(set ? BranchSiderBar : null));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Branches);