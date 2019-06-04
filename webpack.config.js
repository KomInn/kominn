module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "./siteassets/js/bundle.js",
        
    },
    mode:"development",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            {
              test: /\.tsx?$/,
              use: [
                {
                  loader: 'ts-loader'                  
                }
              ]
            },
            {               
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{loader:"url-loader"}]                
              },
              {
                test: /\.css$/,
                use: [
                  { loader: "style-loader" },
                  { loader: "css-loader" }
                ]
              }
          ]
    },
    externals: {
   /*  "react":"React", 
     "react-dom":"ReactDOM"*/
    },
};