require 'erb'

def render_erb fname
  file = File.read("#{fname}.erb")
  ERB.new(file).result(binding)
end

def post_info id
  session = request.env['redd.session']
  submission = session.from_ids ["t3_#{id}"].to_ary
  {
    'score' => submission[0].score,
    'num_comments' => submission[0].num_comments
  }
end
