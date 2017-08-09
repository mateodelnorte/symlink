const async = require('async');
const chalk = require('chalk');
const exec = require('meta-exec');
const fs = require('fs');
const getMetaDependencies = require('./getMetaDependencies');
const path = require('path');

module.exports = (folders, cb) => {
  return getMetaDependencies(folders, (err, graph) => {
    if (err) return cb(err);

    const exec = require('meta-exec');

    async.forEachOf(graph, (repo, key, cb) => {
      
      let numberOfDeps = Object.keys(repo.deps).length;
      
      console.log(chalk.green(`${key} has ${numberOfDeps} dependencies to symlink`));
      
      async.forEachOf(repo.deps, (deps, childKey, cb) => {
 
        let parentPath = graph[key].path;
        let childPath = graph[childKey].path;
        let source = childPath;
        let target = path.join(parentPath, 'node_modules', childKey)

        console.log(chalk.cyan(`creating symlink: ${source} -> ${target}`));

        fs.exists(target, (exists) => {

          if (exists) {
            fs.rmdir(target, (err) => {
              if (err) return cb(err);
              return fs.symlink(source, target, 'dir', cb);
            })
          } else {
            return fs.symlink(source, target, 'dir', cb);
          }

        });

      }, cb);
      
    }, cb);

  });
}