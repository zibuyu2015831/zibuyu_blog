 function getArticle(article_id){
  return `# Anaconda 安装与使用

  虚拟环境是一个可以隔离项目的python解释器和安装模块的工具，
  
  使用虚拟环境可以实现：一个项目对应一个python解释器及其对应模块包，不同项目独立隔离在不同的目录下。
  
  工作中常用的虚拟环境工具：anaconda（开发环境）、virtualenv、miniconda（生产环境）
  
  本文记录Anaconda的安装过程与基本使用命令。
  
  ## 01 Linux安装
  
  第一步：下载Anaconda安装包，需注意安装包存放目录。
  
  \`\`\`bash
  wget https://repo.anaconda.com/archive/Anaconda3-2023.09-0-Linux-x86_64.sh
  \`\`\`
    
  \`\`\`python
  import time

  print(time.time.now())
  \`\`\`

  ![image-20231002210654869](https://files.mdnice.com/user/107/296d7426-52d1-4157-ba3a-76a6ea60a5fc.jpg)
  
  ![image-20231002220516926](https://files.mdnice.com/user/107/296d7426-52d1-4157-ba3a-76a6ea60a5fc.jpg)
  
  第二步：下载的安装包是一个sh脚本文件，执行此文件即可。
  
  ![image-20231002221016264](https://files.mdnice.com/user/107/8fc3319f-c1a0-42dd-a5a5-acba3f50e4da.jpg)
  
  阅读协议，按enter、空格、字母f都可...
  
  ![image-20231002221057713](https://files.mdnice.com/user/107/8fc3319f-c1a0-42dd-a5a5-acba3f50e4da.jpg)
  
  同意协议
  
  ![image-20231002221213122](https://files.mdnice.com/user/107/1c24537b-7137-4c35-8baf-43b0a5aa916f.jpg)
  
  ![image-20231002221704155](https://files.mdnice.com/user/107/1c24537b-7137-4c35-8baf-43b0a5aa916f.jpg)
  
  ![image-20231002221815965](https://files.mdnice.com/user/107/1c24537b-7137-4c35-8baf-43b0a5aa916f.jpg)
  
  安装完成，初始化
  
  ![image-20231002222417525](https://files.mdnice.com/user/107/1c24537b-7137-4c35-8baf-43b0a5aa916f.jpg)
  
  ![image-20231002222837381](https://files.mdnice.com/user/107/1c24537b-7137-4c35-8baf-43b0a5aa916f.jpg)
  
  命令：
  
  \`\`\`bash
  eval "$(/home/zibuyu/anaconda3/bin/conda shell.bash hook)"
  \`\`\`
  
  ![image-20231002223050477](https://img2023.cnblogs.com/blog/2600375/202310/2600375-20231002224832987-574293476.png)
  
  ## 02 小工具
  
  ### ipython
  
  ![image-20231002223447882](https://img2023.cnblogs.com/blog/2600375/202310/2600375-20231002224832609-1805183835.png)
  
  ### jupyter-notebook
  
  ![image-20231002223958363](https://img2023.cnblogs.com/blog/2600375/202310/2600375-20231002224832175-1256631494.png)
  
  ![image-20231002224040514](https://img2023.cnblogs.com/blog/2600375/202310/2600375-20231002224831632-664397609.png)
  
  
  
  ## 03 常用命令
  
  
  创建环境
  \`\`\`bash
  conda create -n 虚拟环境名称 python=版本号
  \`\`\`
  
  查看所有环境
  \`\`\`bash
  conda env list
  \`\`\`
  
  激活虚拟环境
  \`\`\`bash
  conda activate 虚拟环境名称
  \`\`\`
  
  退出当前虚拟环境
  \`\`\`bash
  conda deactivate
  \`\`\`
  
  删除虚拟环境（需先退出）
  \`\`\`bash
  conda remove -n 虚拟环境名称 --all
  \`\`\`
  
  在当前虚拟环境安装第三方包
  \`\`\`bash
   conda install -c conda-forge 包名==版本号
   \`\`\`
  
  删除第三方包
  \`\`\`bash
  conda remove 包名
  \`\`\`
  
  
  其他相关命令：
  
  查看虚拟环境中安装的包：pip freeze 或者 pip list
  
  收集当前环境中安装的包及其版本：pip freeze > requirements.txt
  
  在部署项目的服务器中安装项目使用的模块： pip install -r requirements.txt
  
  
  
  > 注意：
  >
  > 创建虚拟环境时，名称不能使用特殊符号，
  >
  > 虚拟环境名称将来会作为目录名，所以也不能使用特殊符号或中文！！！
  
  提示:
  
  - 虚拟环境只会管理环境内部的模块和python解析器，对于项目源代码毫无关系；
  
  - 创建虚拟环境需要联网；
  - 创建成功后, 需要手动切换到虚拟环境中；
  - 工作在虚拟环境上, 提示符最前面会出现 “(虚拟环境名称)”。`
}

 function getArticleHeads(markdown){
  // Split the markdown content by lines and trim each line
  const lines = markdown.split('\n').map(line => line.trim());
  // Object to store titles with their hierarchy
  const titles = [];
  // Variables to keep track of current position in the hierarchy
  let currentH1 = null;
  let currentH2 = null;
  // Regex patterns for headers
  const h1Pattern = /^# (.*)/;
  const h2Pattern = /^## (.*)/;
  const h3Pattern = /^### (.*)/;
  lines.forEach(line => {
    let match;
    if (match = h1Pattern.exec(line)) {
      currentH1 = { title: match[1], level: 1, children: [] };
      titles.push(currentH1);
      currentH2 = null;  // Reset currentH2 when a new H1 is encountered
    } else if (match = h2Pattern.exec(line)) {
      if (currentH1) {  // Ensure there is an H1 to attach this H2 to
        currentH2 = { title: match[1], level: 2, children: [] };
        currentH1.children.push(currentH2);
      }
    } else if (match = h3Pattern.exec(line)) {
      if (currentH2) {  // Ensure there is an H2 to attach this H3 to
        const currentH3 = { title: match[1], level: 3 };
        currentH2.children.push(currentH3);
      }
    }
  });
  return titles;
}
export{
  getArticle,
  getArticleHeads,
}