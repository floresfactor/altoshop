export default function getDomain(url){
  const parser = document.createElement('a');
  parser.setAttribute('href',url);
  return `${parser.protocol}//${parser.hostname}${parser.port  ? `:${parser.port}`: ``}`;
}