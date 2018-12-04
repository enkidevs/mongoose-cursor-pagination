export default function paginationPlugin(schema, pluginOptions) {
  pluginOptions = pluginOptions || {};

  const minLimit = +pluginOptions.minLimit || 1;
  const maxLimit = +pluginOptions.maxLimit || 100;

  const defaultOptions = {
    key: pluginOptions.key || '_id',
    lean: pluginOptions.lean || false,
    limit: +pluginOptions.limit || 20,
    sort: {},
  };

  schema.statics.paginate = function(query, options, callback) {
    query = query ? { ...query } : {};
    options = options || {};
    options.limit = +options.limit || defaultOptions.limit;
    options = { ...defaultOptions, ...options };

    if (options.limit > maxLimit || options.limit < minLimit) {
      options.limit = defaultOptions.limit;
    }

    const { key, select, populate, lean, limit, sort } = options;
    let reverse = false;

    if (options.startingAfter || options.endingBefore) {
      query[key] = {};

      if (options.endingBefore) {
        query[key] = { $lt: options.endingBefore };

        if (sort[key] > 0) {
          sort[key] = -1;
          reverse = true;
        }
      } else {
        query[key] = { $gt: options.startingAfter };

        if (sort[key] <= 0) {
          sort[key] = 1;
          reverse = true;
        }
      }
    }

    const promise = this.find()
      .where(query)
      .select(select)
      .sort(sort)
      .limit(limit + 1)
      .lean(lean);

    if (populate) {
      [].concat(populate).forEach(item => promise.populate(item));
    }

    return new Promise((resolve, reject) =>
      promise.exec((error, items) => {
        if (error) {
          if (typeof callback === 'function') {
            setImmediate(() => callback(error));
          }

          return reject(error);
        }

        items = items || [];
        const hasMore = items.length === limit + 1;

        if (hasMore) {
          items.pop();
        }

        items = reverse ? items.reverse() : items;

        const results = {
          items,
          hasMore,
        };

        if (typeof callback === 'function') {
          setImmediate(() => callback(null, results));
        }

        return resolve(results);
      })
    );
  };
}
