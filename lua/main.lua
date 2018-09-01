local inspect = require("inspect.lua")

local ThinClient = require("./ThinClient")

local tc = ThinClient("http://www.ccheever.com:1380/api")

local text = "Hello from ThinClient example"


function love:draw()
  love.graphics.print(inspect(text), 400, 300)
end

text = tc:call("login", "ccheever", "acbdefg")
