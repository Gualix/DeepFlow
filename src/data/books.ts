/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  content: string;
  progress: number;
  description?: string;
  isCustom?: boolean;
  coverImage?: string;
  subjects?: string[];
  publicationYear?: number;
  synopsis?: string;
}

export const PRELOADED_BOOKS: Book[] = [
  {
    id: 'alice-en',
    title: 'Alice\'s Adventures in Wonderland',
    author: 'Lewis Carroll',
    language: 'English',
    progress: 0,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    description: 'A young girl named Alice falls through a rabbit hole into a fantasy world populated by peculiar, anthropomorphic creatures.',
    subjects: ['Fantasy', 'Children\'s Literature', 'Adventure'],
    publicationYear: 1865,
    synopsis: 'A surreal journey through Wonderland where logic is inverted and imagination reigns supreme.',
    content: `CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.

The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.

Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well, and noticed that they were filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labelled "ORANGE MARMALADE", but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody, so managed to put it into one of the cupboards as she fell past it.`
  },
  {
    id: 'quijote-es',
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    language: 'Spanish',
    progress: 0,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    description: 'The adventures of a noble who has read too many chivalric romances and decides to become a knight-errant.',
    content: `CAPÍTULO I. Que trata de la condición y ejercicio del famoso hidalgo don Quijote de la Mancha

En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda. El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellori de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada (que en esto hay alguna diferencia en los autores que deste caso escriben), aunque por conjeturas verosímiles se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento: basta que en la narración dél no se salga un punto de la verdad.

Es, pues, de saber que este sobredicho hidalgo, los ratos que estaba ocioso (que eran los más del año), se daba a leer libros de caballerías con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de la caza, y aun la administración de su hacienda; y llegó a tanto su curiosidad y desatino en esto, que vendió muchas hanegas de tierra de sembradura para comprar libros de caballerías en que leer, y así, llevó a su casa todos cuantos pudo haber dellos.`
  },
  {
    id: 'miserables-fr',
    title: 'Les Misérables',
    author: 'Victor Hugo',
    language: 'French',
    progress: 0,
    coverImage: 'https://images.unsplash.com/photo-1543005139-440bf3808906?q=80&w=800&auto=format&fit=crop',
    description: 'A sprawling tale of revolution, redemption, and the struggle for justice in 19th-century France.',
    content: `LIVRE PREMIER—UN JUSTE. CHAPITRE I. MONSIEUR MYRIEL

En 1815, M. Charles-François-Bienvenu Myriel était évêque de Digne. C'était un vieillard d'environ soixante-quinze ans; il occupait le siège de Digne depuis 1806.

Quoique ce détail ne touche en aucune manière au fond même de ce que nous avons à raconter, il n'est peut-être pas inutile, ne fût-ce que pour être exact en tout, d'indiquer ici les bruits et les propos qui avaient couru sur son compte au moment où il était arrivé dans le diocèse. Vrai ou faux, ce qu'on dit des hommes tient souvent autant de place dans leur vie et surtout dans leur destinée que ce qu'ils font. M. Myriel était fils d'un conseiller au parlement d'Aix; noblesse de robe. On contait que son père, le réservant pour hériter de sa charge, l'avait marié de fort bonne heure, à dix-huit ou vingt ans, suivant un usage assez répandu dans les familles parlementaires. Charles Myriel, nonobstant ce mariage, avait, disait-on, beaucoup fait parler de lui. Il était bien fait de sa personne, quoique d'assez petite taille, élégant, gracieux, spirituel; toute la première partie de sa vie avait été donnée au monde et aux galanteries.

La révolution survint; les événements se précipitèrent; les familles parlementaires décimées, chassées, traquées, se dispersèrent. M. Charles Myriel, dès les premiers jours de la révolution, émigra en Italie. Sa femme y mourut d'une maladie de poitrine dont elle souffrait depuis longtemps. Ils n'avaient point d'enfants. Que se passa-t-il ensuite dans la destinée de M. Myriel? L'écroulement de l'ancienne société française, la chute de sa propre famille, les tragiques spectacles de 93, plus effrayants encore peut-être pour les émigrés qui les voyaient de loin avec la grossissante de l'épouvante, firent-ils germer en lui des idées de renoncement et de solitude? Fut-il, au milieu d'une de ces distractions et de ces affections qui occupaient sa vie, brusquement atteint de l'un de ces coups mystérieux et terribles qui viennent quelquefois renverser, en frappant au cœur, l'homme que les catastrophes publiques n'ébranleraient pas en le frappant dans son existence et dans sa fortune? Nul ne l'aurait pu dire; tout ce qu'on savait, c'est que, lorsqu'il revint d'Italie, il était prêtre.`
  }
];
