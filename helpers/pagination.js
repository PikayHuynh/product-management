module.exports = (objectPagination, query, countProducts) => {
  if(query.page) {
    if(!isNaN(parseInt(query.page))) {
      objectPagination.currentPage = parseInt(query.page);
    } else {
      objectPagination.currentPage = 1;
    }
  }

  objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

  const totalPage = Math.ceil(countProducts / objectPagination.limitItems);
  objectPagination.totalPage = totalPage;

  return objectPagination;
};
