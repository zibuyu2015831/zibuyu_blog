function setLocalStorageWithExpiration(key, value, expirationHours) {
  // 计算过期时间（以毫秒为单位）
  const expirationTime = new Date().getTime() + expirationHours * 60 * 60 * 1000;

  // 将值和过期时间一起存储
  localStorage.setItem(key, JSON.stringify({ value, expirationTime }));
}


function getLocalStorageValueWithExpiration(key) {
  // 从localStorage中获取数据
  const storedItem = localStorage.getItem(key);

  // 如果存储的数据不存在，返回undefined
  if (!storedItem) {
    return undefined;
  }

  // 解析存储的数据
  const item = JSON.parse(storedItem);

  // 检查当前时间是否超过了过期时间
  if (new Date().getTime() > item.expirationTime) {
    // 如果过期了，删除该项并返回undefined
    localStorage.removeItem(key);
    return undefined;
  }

  // 如果未过期，返回值
  return item.value;
}


export {
  setLocalStorageWithExpiration,
  getLocalStorageValueWithExpiration,
}
