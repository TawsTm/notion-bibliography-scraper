chrome.runtime.onMessage.addListener((message) => {
  if (message.bibliographyList !== undefined) {
    // create an html list of the bibliography
    document.getElementById('list').innerHTML = '';
    const list = document.createElement('ul');
    message.bibliographyList.forEach((bibliography) => {
      const item = document.createElement('li');
      item.innerText = `${bibliography.author} (${bibliography.year}) ${bibliography.title}. ${bibliography.journal}, ${bibliography.volume}, ${bibliography.pages}.`;
      list.appendChild(item);
    }
    );
    document.getElementById('list').appendChild(list);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (tab.url?.startsWith('chrome://')) return undefined;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: countTRChildrenOfTBodyWithClass
  });
});

function countTRChildrenOfTBodyWithClass() {
  const tableElements = document.querySelectorAll('table.collection-content');
  let bibliographyList = [];

  tableElements.forEach((table) => {
    const tbodyChildren = table.querySelectorAll('tbody > tr');

    tbodyChildren.forEach((tr) => {
      const tdChildren = tr.querySelectorAll('td');
      const author = tdChildren[1].innerText;
      const title = tdChildren[2].innerText;
      const journal = tdChildren[3].innerText;
      const year = tdChildren[5].innerText;
      const volume = tdChildren[6].innerText;
      const pages = tdChildren[7].innerText;
      const publisher = tdChildren[8].innerText;
      const doi = tdChildren[9].innerText;

      bibliographyList.push({
        author, title, journal, year, volume, pages, publisher, doi
      });
    });
  });

  chrome.runtime.sendMessage({ bibliographyList });
}
